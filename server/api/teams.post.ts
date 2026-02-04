import { useDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_user_id')
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const { name, description, rules, raid_date } = body

  if (!name) throw createError({ statusCode: 400, message: 'Name required' })

  const db = useDb()
  try {
    const res = db.prepare('INSERT INTO teams (name, description, owner_id, rules, raid_date) VALUES (?, ?, ?, ?, ?)').run(
      name,
      description || '',
      userId,
      JSON.stringify(rules || []),
      raid_date || new Date().toISOString().split('T')[0]
    )

    // Auto-join owner
    db.prepare('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)').run(res.lastInsertRowid, userId)

    return { id: res.lastInsertRowid, success: true }
  } catch (e) {
    console.error(e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create team' })
  }
})
