import { neon, neonConfig } from '@neondatabase/serverless';

type SqlTag = ReturnType<typeof neon>;
let sql: SqlTag | null = null;
let dbUnavailable = false;

export function getDb(): SqlTag {
  if (dbUnavailable) {
    throw new Error('Database unavailable');
  }
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      dbUnavailable = true;
      throw new Error('DATABASE_URL not set');
    }
    neonConfig.fetchConnectionCache = true;
    sql = neon(connectionString);
  }
  return sql;
}

export async function query(strings: TemplateStringsArray, ...params: any[]): Promise<any[]> {
  try {
    const db = getDb();
    return (await db(strings, ...params)) as any[];
  } catch {
    return [];
  }
}

async function queryRaw(strings: TemplateStringsArray, ...params: any[]) {
  const db = getDb();
  return (await db(strings, ...params)) as any[];
}

export async function rawQueryOrThrow(sql: string, params?: any[]) {
  const db = getDb() as any;
  return (await db.query(sql, params || [])) as any[];
}

export async function initDb() {
  await queryRaw`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await queryRaw`
    CREATE TABLE IF NOT EXISTS streams (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      is_live INTEGER DEFAULT 0,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await queryRaw`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      stream_id INTEGER NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      guest_name TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try { await queryRaw`ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS guest_name TEXT`; } catch {}
  await queryRaw`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      dismissible INTEGER DEFAULT 1,
      persistent INTEGER DEFAULT 0,
      duration_minutes INTEGER
    )
  `;
  await queryRaw`
    CREATE TABLE IF NOT EXISTS stream_sources (
      id SERIAL PRIMARY KEY,
      source_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      event_name TEXT,
      event_date TEXT,
      error TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try { await queryRaw`CREATE UNIQUE INDEX IF NOT EXISTS idx_stream_sources_id ON stream_sources(source_id)`; } catch {}
  await queryRaw`
    CREATE TABLE IF NOT EXISTS ufc_replays (
      id SERIAL PRIMARY KEY,
      fighter1 TEXT,
      fighter2 TEXT,
      fighter1_img TEXT,
      fighter2_img TEXT,
      event TEXT,
      video_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  const db = getDb();
  const migs = [
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS slug TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS title TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS promotion TEXT DEFAULT \'UFC\'',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS event_name TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS weight_class TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS result TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS duration TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS description TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS thumbnail TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS event_date TEXT',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS featured INTEGER DEFAULT 0',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS published INTEGER DEFAULT 1',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  ];
  for (const m of migs) {
    try { await (db as any).query(m); } catch (e: any) { if (!e.message?.includes('already exists')) throw e; }
  }
  const colMigs = [
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS source TEXT DEFAULT \'mmareplayfull\'',
    'ALTER TABLE ufc_replays ADD COLUMN IF NOT EXISTS embed_sources TEXT',
  ];
  for (const m of colMigs) {
    try { await (db as any).query(m); } catch {} 
  }
  try { await (db as any).query("UPDATE ufc_replays SET source = 'mmareplayfull' WHERE source IS NULL AND video_url LIKE '%mmareplayfull%'"); } catch {}
  const adminExists = await queryRaw`SELECT COUNT(*) as count FROM users WHERE username = 'admin'`;
  if (adminExists[0]?.count === '0' || adminExists[0]?.count === 0) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryRaw`
      INSERT INTO users (username, email, password, is_admin)
      VALUES ('admin', 'admin@streaming.com', ${hashedPassword}, 1)
    `;
  }
  const buckledExists = await queryRaw`SELECT COUNT(*) as count FROM users WHERE username = 'buckledpepper'`;
  if (buckledExists[0]?.count === '0' || buckledExists[0]?.count === 0) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('snail', 10);
    await queryRaw`
      INSERT INTO users (username, email, password, is_admin)
      VALUES ('buckledpepper', 'buckled@streaming.com', ${hashedPassword}, 1)
    `;
  }
}
