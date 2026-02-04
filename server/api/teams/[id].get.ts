import { useDb } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const teamId = event.context.params?.id
  const userId = getCookie(event, 'auth_user_id')
  
  if (!teamId) throw createError({ statusCode: 400 })

  const db = useDb()
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as any
  
  if (!team) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  // Check membership
  const member = userId ? db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?').get(teamId, userId) : null
  
  return {
    ...team,
    raid_date: team.raid_date,
    rules: team.rules ? JSON.parse(team.rules) : [],
    isMember: !!member
  }
})
