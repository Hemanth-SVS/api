import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const runtimeDirectory = path.join(process.cwd(), "server", "runtime");
const configuredPath = process.env.SENTINEL_DB_PATH ?? path.join("server", "runtime", "monitoring.sqlite");
const databasePath = path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);

if (!existsSync(runtimeDirectory)) {
  mkdirSync(runtimeDirectory, { recursive: true });
}

const db = new DatabaseSync(databasePath);
const statementCache = new Map();

const statement = (sql) => {
  if (!statementCache.has(sql)) {
    statementCache.set(sql, db.prepare(sql));
  }

  return statementCache.get(sql);
};

export const run = (sql, ...params) => statement(sql).run(...params);
export const get = (sql, ...params) => statement(sql).get(...params);
export const all = (sql, ...params) => statement(sql).all(...params);

export const transaction = (work) => {
  db.exec("BEGIN IMMEDIATE");

  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

const schema = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS monitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    method TEXT NOT NULL,
    interval_seconds INTEGER NOT NULL,
    timeout_ms INTEGER NOT NULL,
    retries INTEGER NOT NULL DEFAULT 0,
    environment TEXT NOT NULL,
    owner TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL DEFAULT '[]',
    expected_status_codes TEXT NOT NULL DEFAULT '200-299',
    expected_body_includes TEXT NOT NULL DEFAULT '',
    header_text TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    paused INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    last_checked_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    failure_streak INTEGER NOT NULL DEFAULT 0,
    unhealthy_streak INTEGER NOT NULL DEFAULT 0,
    analysis_state TEXT NOT NULL DEFAULT 'idle',
    last_analysis_id TEXT,
    last_error_message TEXT
  );

  CREATE TABLE IF NOT EXISTS checks (
    id TEXT PRIMARY KEY,
    monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL,
    checked_at TEXT NOT NULL,
    status TEXT NOT NULL,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    status_code INTEGER,
    classification TEXT NOT NULL,
    message TEXT NOT NULL,
    response_preview TEXT
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    severity TEXT NOT NULL,
    summary TEXT NOT NULL,
    classification TEXT NOT NULL,
    opened_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    resolved_at TEXT,
    latest_check_id TEXT
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    incident_id TEXT REFERENCES incidents(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    source TEXT NOT NULL,
    mode TEXT NOT NULL,
    model TEXT NOT NULL,
    status TEXT NOT NULL,
    facts_json TEXT NOT NULL,
    probable_root_cause TEXT NOT NULL,
    confidence REAL NOT NULL,
    blast_radius TEXT NOT NULL,
    recommended_checks_json TEXT NOT NULL,
    suggested_fixes_json TEXT NOT NULL,
    report_summary TEXT NOT NULL,
    evidence_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_events (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    monitor_id TEXT REFERENCES monitors(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_checks_monitor_checked_at
    ON checks (monitor_id, checked_at DESC);

  CREATE INDEX IF NOT EXISTS idx_incidents_monitor_opened_at
    ON incidents (monitor_id, opened_at DESC);

  CREATE INDEX IF NOT EXISTS idx_analyses_monitor_created_at
    ON analyses (monitor_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_activity_monitor_timestamp
    ON activity_events (monitor_id, timestamp DESC);

  CREATE INDEX IF NOT EXISTS idx_activity_timestamp
    ON activity_events (timestamp DESC);
`;

db.exec(schema);

export const getMeta = (key) => get("SELECT value FROM meta WHERE key = ?", key)?.value ?? null;

export const setMeta = (key, value) => {
  run(
    `
      INSERT INTO meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    key,
    value,
  );
};

export const countRows = (tableName) => {
  const allowed = new Set(["monitors", "checks", "incidents", "analyses", "activity_events"]);

  if (!allowed.has(tableName)) {
    throw new Error(`Unsupported table count for ${tableName}`);
  }

  return get(`SELECT COUNT(*) AS count FROM ${tableName}`)?.count ?? 0;
};

export { databasePath };
