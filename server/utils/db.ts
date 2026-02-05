import { join } from 'node:path'
import Database from 'better-sqlite3'

const dbPath = join('./data/database.sqlite')
const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    qq_id TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    raid_date TEXT, -- YYYY-MM-DD
    owner_id INTEGER DEFAULT 0, -- 0 for public teams or just ownerless for now
    rules JSON, -- Array of rules
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS team_members (
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(team_id, user_id),
    FOREIGN KEY(team_id) REFERENCES teams(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    data JSON,
    subsidy_amount REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(team_id) REFERENCES teams(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(team_id, user_id)
  );
`)

export const useDb = () => db
