import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import { useDb } from '~~/server/utils/db'

dayjs.extend(isoWeek)

export default defineEventHandler((event) => {
  const teamId = event.context.params?.id
  const query = getQuery(event)
  const week = query.week as string // optional, default current

  const db = useDb()

  const records: any[] = db.prepare(`
    SELECT r.*, u.nickname, u.avatar_url, u.qq_id
    FROM records r
    JOIN users u ON r.user_id = u.id
    WHERE r.team_id = ?
    ORDER BY r.subsidy_amount DESC
  `).all(teamId)

  // Calculate Reason strings
  const team = db.prepare('SELECT rules FROM teams WHERE id = ?').get(teamId) as any
  const rules = team?.rules ? JSON.parse(team.rules) : []

  const recordsWithReason = records.map((r: any) => {
    const data = r.data ? JSON.parse(r.data) : {}
    const reasons: string[] = []

    for (const rule of rules) {
      if (data[rule.id]) {
        if (rule.type === 'dps_exact_rank') {
          reasons.push(`DPS排名第${data[rule.id]}`)
        }
        else if (rule.type === 'dps_rank') {
          reasons.push(`DPS排名前${rule.threshold}`)
        }
        else if (rule.type === 'performance') {
          reasons.push(`层数${data[rule.id]}`)
        }
        else if (rule.type === 'fixed') {
          reasons.push(rule.title || '固定补贴')
        }
      }
    }
    return { ...r, reason: reasons.join(', ') || '其他' }
  })

  const total = records.reduce((acc: number, r: any) => acc + r.subsidy_amount, 0)

  return {
    week: team.raid_date || dayjs().format('YYYY-MM-DD'),
    total,
    records: recordsWithReason,
  }
})
