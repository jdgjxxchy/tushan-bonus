
import { useDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const userId = getCookie(event, 'auth_user_id')

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: '请先登录',
    })
  }

  if (!body.name) {
    throw createError({
      statusCode: 400,
      message: 'Team name is required',
    })
  }

  const db = useDb()

  // Check ownership
  const team = db.prepare('SELECT owner_id FROM teams WHERE id = ?').get(id) as any

  if (!team) {
    throw createError({
      statusCode: 404,
      message: 'Team not found',
    })
  }

  if (String(team.owner_id) !== String(userId)) {
    throw createError({
      statusCode: 403,
      message: 'Permission denied',
    })
  }

  // Update team
  db.prepare('UPDATE teams SET name = ? WHERE id = ?').run(body.name, id)

  return { success: true }
})
