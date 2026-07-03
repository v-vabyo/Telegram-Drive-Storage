import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
            db.serialize(() => {
              db.run(`
                CREATE TABLE IF NOT EXISTS sessions (
                  id TEXT PRIMARY KEY,
                  userId TEXT NOT NULL,
                  sessionString TEXT NOT NULL,
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
              `);

              db.run(`
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
              
              db.run(`
                CREATE TABLE IF NOT EXISTS folders (
                  id TEXT PRIMARY KEY,
                  name TEXT NOT NULL,
                  parentId TEXT,
                  telegramChannelId TEXT,
                  ownerId TEXT NOT NULL,
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
              `);
              
              db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                  key TEXT PRIMARY KEY,
                  value TEXT NOT NULL
                )
            `, (err) => {
            if (err) {
              reject(err);
            } else {
              dbInstance = db;
              resolve(dbInstance);
            }
          });
        });
      }
    });
  });
}

export function runQuery(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    const db = await getDb();
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    const db = await getDb();
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    const db = await getDb();
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
