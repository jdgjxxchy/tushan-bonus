import { useDb } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const userId = getCookie(event, 'auth_user_id')
  if (!userId) {
    return null
  }

  const db = useDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  return user || null
})
