import { createClient, type Client } from '@libsql/client';

let _db: Client | null = null;

/**
 * Returns a singleton libsql client, reading connection config from env vars.
 * Falls back to a local SQLite file when TURSO_DATABASE_URL is not set.
 */
export function getDb(): Client {
  if (_db) return _db;

  const url   = process.env.TURSO_DATABASE_URL  ?? 'file:data/vault.db';
  const authToken = process.env.TURSO_AUTH_TOKEN ?? undefined;

  _db = createClient({ url, authToken });
  return _db;
}

/**
 * Initialises the database schema (idempotent — safe to call on every boot).
 */
export async function initSchema(): Promise<void> {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS prompts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      body       TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tags (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS prompt_tags (
      prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
      tag_id    INTEGER NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
      PRIMARY KEY (prompt_id, tag_id)
    );
  `);
}

