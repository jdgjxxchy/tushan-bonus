import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import { useDb } from '~~/server/utils/db'

dayjs.extend(isoWeek)

// Helper to calculate subsidy
function calculateSubsidy(rules: any[], data: any) {
  let total = 0
  for (const rule of rules) {
    if (rule.type === 'custom') {
      // For custom rules, data[rule.id] will be true/1 if selected
      if (data[rule.id]) {
        total += Number(rule.amount)
      }
      continue
    }

    const val = Number(data[rule.id])
    if (Number.isNaN(val))
      continue

    if (rule.type === 'dps_rank') {
      if (val <= Number(rule.threshold))
        total += Number(rule.amount)
    }
    else if (rule.type === 'dps_exact_rank') {
      if (val === Number(rule.threshold))
        total += Number(rule.amount)
    }
    else if (rule.type === 'performance') {
      if (val >= Number(rule.threshold))
        total += Number(rule.amount)
    }
    else if (rule.type === 'layer_count') {
      if (val >= Number(rule.threshold))
        total += Number(rule.amount)
    }
    else if (rule.type === 'fixed') {
      total += Number(rule.amount)
    }
  }
  return total
}

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'auth_user_id')
  if (!userId)
    throw createError({ statusCode: 401 })

  const body = await readBody(event)
  const { team_id, data } = body

  const db = useDb()
  const team = db.prepare('SELECT rules, raid_date FROM teams WHERE id = ?').get(team_id) as any
  if (!team)
    throw createError({ statusCode: 404 })

  const rules = team.rules ? JSON.parse(team.rules) : []
  const amount = calculateSubsidy(rules, data)

  // Ensure one record per user per team
  const existing = db.prepare('SELECT id FROM records WHERE team_id = ? AND user_id = ?').get(team_id, userId)
  if (existing) {
    throw createError({ statusCode: 400, message: '您已登记过该团的数据' })
  }

  db.prepare(`
    INSERT INTO records (team_id, user_id, data, subsidy_amount)
    VALUES (?, ?, ?, ?)
  `).run(team_id, userId, JSON.stringify(data), amount)

  return { success: true, amount }
})
