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
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
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
  const adminExists = await queryRaw`SELECT COUNT(*) as count FROM users WHERE username = 'admin'`;
  if (adminExists[0]?.count === '0' || adminExists[0]?.count === 0) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryRaw`
      INSERT INTO users (username, email, password, is_admin)
      VALUES ('admin', 'admin@streaming.com', ${hashedPassword}, 1)
    `;
  }
}
