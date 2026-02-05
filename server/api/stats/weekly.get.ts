import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import { useDb } from '~~/server/utils/db'

dayjs.extend(isoWeek)

export default defineEventHandler((event) => {
  const query = getQuery(event)
  let weekStart = query.week as string

  if (!weekStart) {
    weekStart = dayjs().startOf('isoWeek').toISOString().split('T')[0]
  }

  const db = useDb()

  // Calculate week range
  const start = dayjs(weekStart)
  const end = start.add(6, 'day')
  const startDate = start.format('YYYY-MM-DD')
  const endDate = end.format('YYYY-MM-DD')

  // Get all records where the TEAM's raid_date falls in this week
  const records = db.prepare(`
    SELECT r.*, u.nickname, u.avatar_url, u.qq_id, t.name as team_name, t.raid_date
    FROM records r
    JOIN users u ON r.user_id = u.id
    JOIN teams t ON r.team_id = t.id
    WHERE t.raid_date >= ? AND t.raid_date <= ?
    ORDER BY u.id
  `).all(startDate, endDate) as any[]

  // Aggregate
  const statsMap = new Map<number, any>()

  for (const r of records) {
    if (!statsMap.has(r.user_id)) {
      statsMap.set(r.user_id, {
        user_id: r.user_id,
        nickname: r.nickname,
        avatar_url: r.avatar_url,
        qq_id: r.qq_id,
        total_amount: 0,
        breakdown: [],
      })
    }

    const user = statsMap.get(r.user_id)
    user.total_amount += r.subsidy_amount
    user.breakdown.push({
      id: r.id,
      team_name: r.team_name,
      subsidy_amount: r.subsidy_amount,
    })
  }

  return Array.from(statsMap.values()).sort((a, b) => b.total_amount - a.total_amount)
})
