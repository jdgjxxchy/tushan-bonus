import { useDb } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const userId = getCookie(event, 'auth_user_id')
  const query = getQuery(event)
  const db = useDb()

  if (query.my && userId) {
    const teams = db.prepare(`
       SELECT t.id, t.name, t.description, t.created_at, t.raid_date,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count 
       FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = ?
       ORDER BY t.created_at DESC
     `).all(userId)
    return teams
  }

  // Return all teams for search
  const teams = db.prepare(`
    SELECT t.id, t.name, t.description, t.created_at, t.raid_date,
           (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count 
    FROM teams t 
    ORDER BY t.created_at DESC LIMIT 50
  `).all()

  return teams
})
