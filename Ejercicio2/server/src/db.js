import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDb(dbPath) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NULL,
      project_name TEXT,                      -- snapshot del nombre
      created_at TEXT DEFAULT (datetime('now')),
      answers_json TEXT DEFAULT '{}',         -- { [questionId]: "si|parcial|no" }
      kpa_scores_json TEXT DEFAULT '{}',      -- { [KPA]: { percent, detail } }
      recommendations_json TEXT DEFAULT '{}', -- { [KPA]: [acciones] }
      overall_json TEXT DEFAULT '{}',         -- { overallPercent, level2Verified, conclusion }
      status TEXT DEFAULT 'draft',
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
  `);

  return db;
}
