import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import { useDb } from '~~/server/utils/db'

dayjs.extend(isoWeek)

export default defineEventHandler((event) => {
  const userId = getCookie(event, 'auth_user_id')
  const query = getQuery(event)
  const db = useDb()

  let sql = `
       SELECT t.id, t.name, t.description, t.created_at, t.raid_date, t.owner_id,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count 
       FROM teams t 
       WHERE t.is_deleted = 0
    `
  const params: any[] = []

  if (query.filter === 'weekly') {
    const monday = dayjs().startOf('isoWeek').format('YYYY-MM-DD')
    const sunday = dayjs().endOf('isoWeek').format('YYYY-MM-DD')
    sql += ' AND t.raid_date >= ? AND t.raid_date <= ?'
    params.push(monday, sunday)
  }

  sql += ' ORDER BY t.raid_date DESC, t.created_at DESC'
  return db.prepare(sql).all(...params)
})
