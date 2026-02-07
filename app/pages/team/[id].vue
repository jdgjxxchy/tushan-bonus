<script setup lang="ts">
const route = useRoute()
const teamId = route.params.id as string
const userStore = useUserStore()
const message = useMessage()

definePageMeta({ middleware: 'auth' })

const { data: team } = await useFetch<any>(`/api/teams/${teamId}`)

// Registration Logic
const activeTab = ref('register') // register, settlement
const submitting = ref(false)
const lastResult = ref<any>(null)
const notification = useNotification()

// New UI Logic
const roleType = ref<'dps' | 'support' | null>(null)
const selectedRuleId = ref<string | null>(null)
const selectedOtherRuleIds = ref<Set<string>>(new Set())

function switchRole(type: 'dps' | 'support') {
  roleType.value = type
  selectedRuleId.value = null
}

function selectRule(ruleId: string) {
  selectedRuleId.value = ruleId
}

function toggleOtherRule(ruleId: string) {
  if (selectedOtherRuleIds.value.has(ruleId))
    selectedOtherRuleIds.value.delete(ruleId)
  else
    selectedOtherRuleIds.value.add(ruleId)
}

// Pre-fill existing record
watchEffect(() => {
  if (team.value?.userRecord) {
    const recordData = team.value.userRecord.data
    selectedOtherRuleIds.value.clear()

    // Distinguish between role rules and other rules
    Object.keys(recordData).forEach((ruleId) => {
      const rule = team.value.rules.find((r: any) => r.id === ruleId)
      if (rule) {
        if (rule.category === 'other') {
          selectedOtherRuleIds.value.add(ruleId)
        }
        else {
          selectedRuleId.value = ruleId
          roleType.value = rule.category as 'dps' | 'support'
        }
      }
    })
  }
})

// Settlement Logic - Moved up to be available for submitRecord
const { data: settlement, refresh: refreshSettlement } = await useFetch<any>(`/api/teams/${teamId}/settlement`, {
  key: `settlement-${teamId}`,
  immediate: false,
})

watch(activeTab, (val) => {
  if (val === 'settlement')
    refreshSettlement()
})

async function submitRecord() {
  if (!selectedRuleId.value && selectedOtherRuleIds.value.size === 0) {
    message.warning('请至少选择一个补贴项')
    return
  }

  submitting.value = true
  lastResult.value = null

  // Construct submission data based on selection
  const data: Record<string, number> = {}

  if (selectedRuleId.value) {
    data[selectedRuleId.value] = 1
  }

  selectedOtherRuleIds.value.forEach((id) => {
    data[id] = 1
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
  catch {
    message.error('提交失败')
  }
  finally {
    submitting.value = false
  }
}

async function cancelRecord() {
  submitting.value = true
  try {
    await $fetch('/api/records', {
      method: 'DELETE',
      body: { team_id: teamId },
    })
    message.success('已取消登记')
    refreshSettlement()
    // Reset local state
    selectedRuleId.value = null
    selectedOtherRuleIds.value.clear()
    roleType.value = null
  }
  catch {
    message.error('取消失败')
  }
  finally {
    submitting.value = false
  }
}

async function deleteTeam() {
  try {
    await $fetch(`/api/teams/${teamId}`, { method: 'DELETE' })
    notification.success({ title: '删除成功', duration: 3000 })
    navigateTo('/dashboard')
  }
  catch {
    message.error('删除失败')
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
        <n-popconfirm v-if="String(team.owner_id) === String(userStore.user?.id)" @positive-click="deleteTeam">
          <template #trigger>
            <button class="text-sm text-red-500 font-medium ml-auto flex gap-1 transition-colors items-center hover:text-red-700">
              <div class="i-carbon-trash-can" /> 删除团队
            </button>
          </template>
          确定要删除该团队吗？此操作不可撤销。
        </n-popconfirm>
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
        <!-- Subsidy Selection -->
        <div class="space-y-8">
          <!-- Role Rewards Section -->
          <div class="space-y-4">
            <label class="text-sm text-gray-700 font-medium block">
              职责补贴 <span class="text-xs text-gray-400 font-normal">（二选一）</span>
            </label>
            <div class="flex gap-4">
              <button
                class="py-4 border-2 rounded-xl flex flex-1 flex-col gap-2 transition-colors items-center"
                :class="roleType === 'dps' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-200 text-gray-500'"
                @click="switchRole('dps')"
              >
                <div class="i-carbon-chart-line text-2xl" />
                <span class="font-bold">输出</span>
              </button>

              <button
                class="py-4 border-2 rounded-xl flex flex-1 flex-col gap-2 transition-colors items-center"
                :class="roleType === 'support' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-200 text-gray-500'"
                @click="switchRole('support')"
              >
                <div class="i-carbon-favorite text-2xl" />
                <span class="font-bold">奶/T</span>
              </button>
            </div>

            <!-- Role Cards -->
            <div v-if="roleType" class="mt-4 p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
              <h3 class="text-sm text-gray-700 font-medium mb-4 italic">
                请选择一项您在本团符合的条件
              </h3>

              <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <button
                  v-for="rule in team.rules.filter((r: any) => r.category === roleType)"
                  :key="rule.id"
                  class="p-4 text-left border-2 rounded-xl flex flex-col gap-1 transition-all"
                  :class="selectedRuleId === rule.id ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'border-gray-100 bg-gray-50/50 hover:border-teal-200'"
                  @click="selectRule(rule.id)"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-gray-800 font-bold">{{ rule.name }}</span>
                    <div
                      class="border-2 rounded-full flex h-5 w-5 transition-colors items-center justify-center"
                      :class="selectedRuleId === rule.id ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-white'"
                    >
                      <div v-if="selectedRuleId === rule.id" class="i-carbon-checkmark text-xs text-white" />
                    </div>
                  </div>
                  <div class="text-lg text-teal-600 font-bold">
                    {{ rule.amount }} G
                  </div>
                </button>
              </div>

              <div v-if="team.rules.filter((r: any) => r.category === roleType).length === 0" class="text-gray-400 py-6 text-center italic">
                当前职责下暂无补贴项
              </div>
            </div>
          </div>

          <!-- Other Rewards Section -->
          <div v-if="team.rules.some((r: any) => r.category === 'other')" class="space-y-4">
            <label class="text-sm text-gray-700 font-medium block">
              额外补贴 <span class="text-xs text-gray-400 font-normal">（可多选/叠加）</span>
            </label>
            <div class="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
              <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <button
                  v-for="rule in team.rules.filter((r: any) => r.category === 'other')"
                  :key="rule.id"
                  class="p-4 text-left border-2 rounded-xl flex flex-col gap-1 transition-all"
                  :class="selectedOtherRuleIds.has(rule.id) ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'border-gray-100 bg-gray-50/50 hover:border-teal-200'"
                  @click="toggleOtherRule(rule.id)"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-gray-800 font-bold">{{ rule.name }}</span>
                    <div
                      class="border-2 rounded-md flex h-5 w-5 transition-colors items-center justify-center"
                      :class="selectedOtherRuleIds.has(rule.id) ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-white'"
                    >
                      <div v-if="selectedOtherRuleIds.has(rule.id)" class="i-carbon-checkmark text-xs text-white" />
                    </div>
                  </div>
                  <div class="text-lg text-teal-600 font-bold">
                    {{ rule.amount }} G
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-12 gap-4 grid grid-cols-2">
            <button
              :disabled="submitting || (!selectedRuleId && selectedOtherRuleIds.size === 0)"
              class="text-xl btn text-white font-bold py-4 bg-teal-600 shadow-none disabled:bg-gray-300 hover:bg-teal-700 disabled:cursor-not-allowed"
              @click="submitRecord"
            >
              <div v-if="submitting" class="i-carbon-circle-dash animate-spin" />
              <span v-else>确认并提交</span>
            </button>
            <button
              :disabled="submitting"
              class="text-xl btn text-gray-500 font-bold py-4 bg-gray-100 shadow-none hover:bg-gray-200"
              @click="cancelRecord"
            >
              <span>取消登记</span>
            </button>
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
  <div v-else />
</template>
