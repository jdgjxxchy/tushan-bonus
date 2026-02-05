import { useDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_user_id')
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const { nickname } = body

  if (!nickname) throw createError({ statusCode: 400, message: 'Nickname required' })

  const db = useDb()
  try {
    db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, userId)
    return { success: true }
  } catch (e) {
    console.error(e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update nickname' })
  }
})
