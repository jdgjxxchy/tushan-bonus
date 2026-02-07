import { useDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { qq_id, nickname } = body
  
  if (!qq_id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing QQ ID' })
  }

  const db = useDb()
  const user = db.prepare('SELECT * FROM users WHERE qq_id = ?').get(qq_id) as any

  if (!user && !nickname) {
    throw createError({ statusCode: 404, statusMessage: 'REGISTER_REQUIRED' })
  }

  let userId
  let avatar = `https://q1.qlogo.cn/g?b=qq&nk=${qq_id}&s=100` // QQ Avatar API logic

  if (!user) {
    const info = db.prepare('INSERT INTO users (qq_id, nickname, avatar_url) VALUES (?, ?, ?)').run(qq_id, nickname, avatar)
    userId = info.lastInsertRowid
  } else {
    // Update nickname/avatar if provided
    if (nickname) {
      db.prepare('UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?').run(nickname, avatar, user.id)
    }
    userId = user.id
  }

  setCookie(event, 'auth_user_id', String(userId), { path: '/', maxAge: 60 * 60 * 24 * 7 }) // 1 week

  return { 
    id: userId,
    qq_id,
    nickname,
    avatar_url: avatar
  }
})
