
import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

console.log('Migrating records table...');

db.transaction(() => {
  // 1. Rename existing table
  db.exec('ALTER TABLE records RENAME TO records_old');

  // 2. Create new table without week_start_date, with unique constraint on (team_id, user_id)
  db.exec(`
    CREATE TABLE records (
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
  `);

  // 3. Copy data (ignoring week_start_date)
  // We use INSERT OR REPLACE to handle potential duplicates if they existed (though we cleaned them up)
  db.exec(`
    INSERT OR REPLACE INTO records (id, team_id, user_id, data, subsidy_amount, created_at)
    SELECT id, team_id, user_id, data, subsidy_amount, created_at
    FROM records_old;
  `);

  // 4. Drop old table
  db.exec('DROP TABLE records_old');
})();

console.log('Migration complete.');
