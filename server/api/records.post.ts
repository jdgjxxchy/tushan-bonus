import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import { useDb } from '~~/server/utils/db'

dayjs.extend(isoWeek)

// Helper to calculate subsidy
function calculateSubsidy(rules: any[], data: any) {
  let total = 0
  for (const rule of rules) {
    const val = Number(data[rule.id])
    if (isNaN(val))
      continue

    if (rule.type === 'dps_rank') {
      // Example: Rule threshold 3 (Top 3). Input 1 -> Match. Input 4 -> No.
      if (val <= Number(rule.threshold))
        total += Number(rule.amount)
    }
    else if (rule.type === 'dps_exact_rank') {
      // Specific rank match (e.g. Rank 1 only)
      if (val === Number(rule.threshold))
        total += Number(rule.amount)
    }
    else if (rule.type === 'performance') {
      // Performance score (e.g. 90+, 100)
      if (val >= Number(rule.threshold))
        total += Number(rule.amount)
    }
    else if (rule.type === 'layer_count') {
      // Example: Rule threshold 10 (10 Layers). Input 12 -> Match. Input 5 -> No.
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
