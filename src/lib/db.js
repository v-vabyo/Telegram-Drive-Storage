import { createClient } from '@libsql/client';
import path from 'path';

const url = process.env.TURSO_DATABASE_URL || `file:${path.resolve(process.cwd(), 'database.sqlite')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const client = createClient({
    url,
    authToken,
  });

  // Run migrations/schema setup
  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      sessionString TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      size INTEGER NOT NULL,
      mimeType TEXT NOT NULL,
      telegramFileId TEXT NOT NULL,
      folderId TEXT,
      ownerId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parentId TEXT,
      telegramChannelId TEXT,
      ownerId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Run migrations silently (ignore errors if columns already exist)
  const migrations = [
    "ALTER TABLE files ADD COLUMN isStarred INTEGER DEFAULT 0",
    "ALTER TABLE files ADD COLUMN isDeleted INTEGER DEFAULT 0",
    "ALTER TABLE files ADD COLUMN deletedAt DATETIME",
    "ALTER TABLE folders ADD COLUMN isStarred INTEGER DEFAULT 0",
    "ALTER TABLE folders ADD COLUMN isDeleted INTEGER DEFAULT 0",
    "ALTER TABLE folders ADD COLUMN deletedAt DATETIME"
  ];
  
  for (const sql of migrations) {
    try {
      await client.execute(sql);
    } catch (e) {
      // Ignore if column already exists
    }
  }

  dbInstance = client;
  return dbInstance;
}

export async function runQuery(sql, params = []) {
  const db = await getDb();
  const res = await db.execute({ sql, args: params });
  return { 
    lastID: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : null, 
    changes: res.rowsAffected 
  };
}

export async function getQuery(sql, params = []) {
  const db = await getDb();
  const res = await db.execute({ sql, args: params });
  return res.rows[0];
}

export async function allQuery(sql, params = []) {
  const db = await getDb();
  const res = await db.execute({ sql, args: params });
  return res.rows;
}
