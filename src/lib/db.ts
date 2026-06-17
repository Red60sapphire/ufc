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
