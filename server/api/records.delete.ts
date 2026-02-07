import { useDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_user_id')
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { team_id } = await readBody(event)
  if (!team_id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing team_id' })
  }

  const db = useDb()
  const res = db.prepare('DELETE FROM records WHERE team_id = ? AND user_id = ?').run(team_id, userId)

  if (res.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Record not found' })
  }

  return { success: true }
})
