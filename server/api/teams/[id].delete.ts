import { useDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_user_id')
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const teamId = getRouterParam(event, 'id')
  const db = useDb()

  // Check ownership
  const team = db.prepare('SELECT owner_id FROM teams WHERE id = ?').get(teamId) as any
  if (!team) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  if (String(team.owner_id) !== String(userId)) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can delete this team' })
  }

  // Soft delete
  db.prepare('UPDATE teams SET is_deleted = 1 WHERE id = ?').run(teamId)

  return { success: true }
})
