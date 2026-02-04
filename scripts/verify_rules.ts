import { describe, expect, it } from 'vitest'

// Mock the rule logic from records.post.ts content for testing
function calculateSubsidy(rules: any[], data: any) {
  let total = 0
  for (const rule of rules) {
    const val = Number(data[rule.id])
    if (isNaN(val))
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
    else if (rule.type === 'fixed') {
      total += Number(rule.amount)
    }
  }
  return total
}

// Test Case
const rules = [
  { id: 'dps_1', type: 'dps_exact_rank', threshold: 1, amount: 200 },
  { id: 'dps_2', type: 'dps_exact_rank', threshold: 2, amount: 100 },
  { id: 'perf_90', type: 'performance', threshold: 90, amount: 50 },
  { id: 'perf_100', type: 'performance', threshold: 100, amount: 150 }, // should likely be cumulative or max?
  // Wait, if I have 100, do I get 90+ bonus too?治疗/坦
  // Current logic: if rule 90+ exists and val is 100, checking rule 90+ (100 >= 90) -> YES.
  // checking rule 100 (100 >= 100) -> YES.
  // So 100 gets both 90+ AND 100 bonuses = 200 total?
  // If user wants distinct, they need to set amounts accordingly or we change logic.
  // "90+" usually means >90 gets X. "100" means 100 gets Y.
  // If I score 100, I am >90.
  // The user UI has separate boxes.
  // Let's assume cumulative is safer unless specified otherwise.
]

const data1 = { dps_1: 1 } // Rank 1
// Should get 200

const data2 = { dps_2: 2 } // Rank 2
// Should get 100

const data3 = { perf_90: 95 } // Score 95
// Should get 50 (matches 90+)

const data4 = { perf_90: 100, perf_100: 100 } // Score 100, passed to both inputs?
// Wait, the input name in create-team is by ID.
// In create-team: id: `perf_${r.threshold}` -> `perf_90`, `perf_100`.
// But the data comes from `records.post.ts` receiving `data` object.
// The data object keys must match rule IDs.
// When a user submits a record, they need to fill in these fields.
// The record submission UI likely needs to know these keys. This is a point I haven't touched yet: The Record Submission Page.
// I only touched Create Team. The user didn't ask to fix Record Submission yet, but if I change the IDs, the submission page might break or need updates.
// The submission page likely reads `team.rules` and generates inputs.
// Let's check `records.post.ts` again. It calculates based on `data[rule.id]`.
// So if I have rules with IDs `dps_1`, `perf_90`, the submission UI must generate inputs with these names.
// I need to check the record submission UI or make sure it's dynamic.
// `server/api/teams/[id].get.ts` returns the rules.
// A frontend page likely iterates these rules to create inputs.
// I should check `app/pages/team/[id].vue` or wherever records are added.

console.log('Rank 1 Subsidy:', calculateSubsidy(rules, { dps_1: 1 })) // 200
console.log('Rank 2 Subsidy:', calculateSubsidy(rules, { dps_2: 2 })) // 100
console.log('Perf 95 Subsidy:', calculateSubsidy(rules, { perf_90: 95 })) // 50
console.log('Perf 100 Subsidy (Cumulative):', calculateSubsidy(rules, { perf_90: 100, perf_100: 100 })) // 200
