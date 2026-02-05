<script setup lang="ts">
const route = useRoute()
const teamId = route.params.id
const userStore = useUserStore()

definePageMeta({ middleware: 'auth' })

const { data: team, refresh } = await useFetch(`/api/teams/${teamId}`)

// Registration Logic
const activeTab = ref('register') // register, settlement
const submission = ref<Record<string, number>>({})
const submitting = ref(false)
const lastResult = ref<any>(null)
const notification = useNotification()

// New UI Logic
const roleType = ref<'dps' | 'support'>('dps')
const dpsRank = ref<number | null>(null)
const supportScore = ref<number | null>(null) // 90 or 100

function switchRole(type: 'dps' | 'support') {
  roleType.value = type
  dpsRank.value = null
  supportScore.value = null
}

// Settlement Logic - Moved up to be available for submitRecord
const { data: settlement, refresh: refreshSettlement } = await useFetch(`/api/teams/${teamId}/settlement`, {
  key: `settlement-${teamId}`,
  immediate: false,
})

watch(activeTab, (val) => {
  if (val === 'settlement')
    refreshSettlement()
})

async function submitRecord() {
  submitting.value = true
  lastResult.value = null

  // Construct submission data based on selection
  const data: Record<string, number> = {}

  if (roleType.value === 'dps' && dpsRank.value) {
    // Find matching rank rules
    team.value.rules.forEach((r: any) => {
      // Logic: if rule is exact rank and matches input
      if ((r.type === 'dps_exact_rank' && Number(r.threshold) === dpsRank.value)
        || (r.type === 'dps_rank' && dpsRank.value <= Number(r.threshold))) {
        data[r.id] = dpsRank.value
      }
    })
  }
  else if (roleType.value === 'support' && supportScore.value) {
    team.value.rules.forEach((r: any) => {
      if (r.type === 'performance') {
        // Apply score to all performance rules
        // Backend checks val >= threshold.
        // If I select 100, and rule is 90+, 100 >= 90. OK.
        data[r.id] = supportScore.value
      }
    })
  }

  // Also include fixed rules if any (auto-apply)
  team.value.rules.forEach((r: any) => {
    if (r.type === 'fixed') {
      data[r.id] = 1
    }
  })

  try {
    const res: any = await $fetch('/api/records', {
      method: 'POST',
      body: {
        team_id: teamId,
        data,
      },
    })
    lastResult.value = res
    notification.success({
      title: '登记成功',
      content: `本团预计获得补贴: ${res.amount} G`,
      duration: 5000,
    })
    refreshSettlement()
  }
  catch (e) {
    alert('提交失败')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="team" class="mx-auto max-w-5xl">
    <div class="mb-8">
      <div class="mb-2 flex gap-4 items-center">
        <button class="i-carbon-arrow-left text-2xl icon-btn" @click="navigateTo('/dashboard')" />
        <h1 class="title">
          {{ team.name }}
        </h1>
      </div>
      <p class="text-gray-500">
        {{ team.description }}
      </p>
    </div>

    <!-- Tabs -->
    <div class="mb-8 border-b border-gray-200 flex gap-6">
      <button
        v-for="tab in [{ k: 'register', l: '团队登记' }, { k: 'settlement', l: '团队结算' }]"
        :key="tab.k"
        class="text-lg font-medium px-2 pb-2 border-b-2 transition-all relative"
        :class="activeTab === tab.k ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="activeTab = tab.k"
      >
        {{ tab.l }}
      </button>
    </div>

    <!-- Tab Content: Register -->
    <div v-if="activeTab === 'register'" class="card space-y-8">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">
          本周数据登记
        </h2>
        <div class="text-sm text-gray-400 font-mono">
          本周: {{ new Date().toLocaleDateString() }}
        </div>
      </div>

      <div v-if="team.rules.length === 0" class="text-gray-400 py-4 text-center">
        该队伍暂无补贴规则
      </div>

      <div v-else class="space-y-8">
        <!-- Role Selection -->
        <div>
          <label class="text-sm text-gray-700 font-medium mb-3 block">选择您的职责</label>
          <div class="flex gap-4">
            <button
              class="py-4 border-2 rounded-xl flex flex-1 flex-col gap-2 transition-colors items-center"
              :class="roleType === 'dps' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-200 text-gray-500'"
              @click="switchRole('dps')"
            >
              <div class="i-carbon-chart-line text-2xl" />
              <span class="font-bold">DPS (输出)</span>
            </button>

            <button
              class="py-4 border-2 rounded-xl flex flex-1 flex-col gap-2 transition-colors items-center"
              :class="roleType === 'support' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-pink-200 text-gray-500'"
              @click="switchRole('support')"
            >
              <div class="i-carbon-favorite text-2xl" />
              <span class="font-bold">Healer / Tank (辅助/T)</span>
            </button>
          </div>

          <!-- DPS Input -->
          <div v-if="roleType" class="mt-4 p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
            <div v-if="roleType === 'dps'" class="space-y-4">
              <label class="text-sm text-gray-700 font-medium block">请输入您的排名</label>
              <div class="flex gap-4 items-center">
                <div class="i-carbon-trophy text-2xl text-yellow-500" />
                <input
                  v-model.number="dpsRank"
                  type="number"
                  min="1"
                  max="20"
                  class="text-3xl font-bold py-2 text-center outline-none border-b-2 border-gray-200 bg-transparent flex-1 focus:border-teal-500"
                  placeholder="1"
                >
              </div>
            </div>

            <div v-if="roleType === 'support'" class="space-y-4">
              <label class="text-sm text-gray-700 font-medium block">层数</label>
              <div class="gap-4 grid grid-cols-2">
                <button
                  class="text-lg font-bold py-3 border rounded-lg transition-colors"
                  :class="supportScore === 90 ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-200 text-gray-600 hover:border-pink-300'"
                  @click="supportScore = 90"
                >
                  90 层+
                </button>
                <button
                  class="text-lg font-bold py-3 border rounded-lg transition-colors"
                  :class="supportScore === 100 ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-200 text-gray-600 hover:border-pink-300'"
                  @click="supportScore = 100"
                >
                  100 层
                </button>
              </div>
            </div>

            <div class="mt-8">
              <button
                :disabled="submitting || (!dpsRank && !supportScore)"
                class="text-xl btn text-white font-bold py-4 bg-teal-600 w-full shadow-none disabled:bg-gray-300 hover:bg-teal-700 disabled:cursor-not-allowed"
                @click="submitRecord"
              >
                <div v-if="submitting" class="i-carbon-circle-dash animate-spin" />
                <span v-else>提交登记</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Settlement -->
    <div v-if="activeTab === 'settlement' && settlement" class="card p-0 overflow-hidden">
      <div class="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">
            本周结算表
          </h2>
          <div class="text-sm text-gray-500">
            统计周期: {{ settlement.week }}起
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">
            总计发放
          </div>
          <div class="text-2xl text-teal-600 font-bold">
            {{ settlement.total }} G
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="text-left w-full">
          <thead>
            <tr class="text-sm text-gray-400 border-b border-gray-100">
              <th class="font-medium px-6 py-4">
                登记时间
              </th>
              <th class="font-medium px-6 py-4">
                团员
              </th>
              <th class="font-medium px-6 py-4">
                QQ号
              </th>
              <th class="font-medium px-6 py-4">
                来源/备注
              </th>
              <th class="font-medium px-6 py-4 text-right">
                补贴金额
              </th>
            </tr>
          </thead>
          <tbody class="divide-gray-100 divide-y">
            <tr v-for="record in settlement.records" :key="record.id" class="transition-colors hover:bg-gray-50">
              <td class="text-gray-500 px-6 py-4">
                {{ new Date(record.created_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 flex gap-3 items-center">
                <img :src="record.avatar_url" class="border border-gray-200 rounded-full h-8 w-8">
                <span class="font-medium">{{ record.nickname }}</span>
              </td>
              <td class="text-sm text-gray-500 font-mono px-6 py-4">
                {{ record.qq_id }}
              </td>
              <td class="text-gray-500 font-medium px-6 py-4">
                {{ record.reason || '其他' }}
              </td>
              <td class="text-teal-600 font-bold px-6 py-4 text-right">
                {{ record.subsidy_amount }} G
              </td>
            </tr>
            <tr v-if="settlement.records.length === 0">
              <td colspan="4" class="text-gray-400 py-10 text-center">
                <div class="i-carbon-catalog text-4xl mx-auto mb-2 opacity-20" />
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
