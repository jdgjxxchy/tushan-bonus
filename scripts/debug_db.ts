
import Database from 'better-sqlite3'
import { join } from 'path'

const db = new Database('database.sqlite')

const teams = db.prepare('SELECT * FROM teams').all()
console.log('--- TEAMS ---')
console.table(teams)

const records = db.prepare('SELECT * FROM records').all()
console.log('--- RECORDS ---')
console.table(records)
