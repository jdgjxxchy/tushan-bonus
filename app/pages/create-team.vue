<script setup lang="ts">
import dayjs from 'dayjs'
import { NDatePicker, NSelect } from 'naive-ui'

definePageMeta({
  middleware: 'auth',
})

const name = ref('')
const description = ref('')
const loading = ref(false)
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

// Date handling for Naive UI (timestamp)
const raidDateTs = ref(Date.now())

// Fixed Rule Inputs
const dpsRules = ref([
  { rank: 1, amount: null as number | null },
  { rank: 2, amount: null as number | null },
  { rank: 3, amount: null as number | null },
  { rank: 4, amount: null as number | null },
  { rank: 5, amount: null as number | null },
  { rank: 6, amount: null as number | null },
])

const perfRules = ref([
  { threshold: 90, amount: null as number | null },
  { threshold: 100, amount: null as number | null },
])

// Templates
const templates = useLocalStorage('rule-templates', [] as { name: string, dps: any[], perf: any[] }[])
const currentTemplateName = ref('')
const selectedTemplate = ref(null)

const templateOptions = computed(() => {
  return templates.value.map(t => ({ label: t.name, value: t.name }))
})

function saveTemplate() {
  if (!currentTemplateName.value)
    return

  const existing = templates.value.findIndex(t => t.name === currentTemplateName.value)
  const templateData = {
    name: currentTemplateName.value,
    dps: JSON.parse(JSON.stringify(dpsRules.value)),
    perf: JSON.parse(JSON.stringify(perfRules.value)),
  }

  if (existing >= 0) {
    dialog.warning({
      title: '确认覆盖',
      content: '该模板名称已存在，是否作为副本创建？(取消则覆盖现有模板)',
      positiveText: '作为副本',
      negativeText: '覆盖现有',
      onPositiveClick: () => {
        templates.value.push(templateData)
        message.success('模板已作为副本保存')
        currentTemplateName.value = ''
      },
      onNegativeClick: () => {
        templates.value[existing] = templateData
        message.success('模板已覆盖')
        currentTemplateName.value = ''
      },
    })
  }
  else {
    templates.value.push(templateData)
    message.success('模板已保存')
    currentTemplateName.value = ''
  }
}

function loadTemplate(tName: string) {
  if (!tName)
    return
  const t = templates.value.find(x => x.name === tName)
  if (t) {
    dpsRules.value = JSON.parse(JSON.stringify(t.dps))
    perfRules.value = JSON.parse(JSON.stringify(t.perf))
  }
}

function deleteTemplate(index: number) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这个模板吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      templates.value.splice(index, 1)
      if (selectedTemplate.value)
        selectedTemplate.value = null
      message.success('模板已删除')
    },
  })
}

watch(selectedTemplate, (val) => {
  if (val)
    loadTemplate(val)
})

async function createTeam() {
  if (!name.value)
    return
  loading.value = true

  // Format Date (Local)
  const dateStr = dayjs(raidDateTs.value).format('YYYY-MM-DD')

  // Convert inputs to rule format
  const rules = []

  // DPS Rules
  for (const r of dpsRules.value) {
    if (r.amount && r.amount > 0) {
      rules.push({
        id: `dps_${r.rank}`,
        type: 'dps_exact_rank',
        threshold: r.rank,
        amount: r.amount,
        description: `输出第 ${r.rank} 名`,
      })
    }
  }

  // Performance Rules
  for (const r of perfRules.value) {
    if (r.amount && r.amount > 0) {
      rules.push({
        id: `perf_${r.threshold}`,
        type: 'performance',
        threshold: r.threshold,
        amount: r.amount,
        description: `层数 ${r.threshold}+`,
      })
    }
  }

  // Basic check
  if (rules.length === 0) {
    dialog.warning({
      title: '确认发布',
      content: '未设置任何补贴规则，确定要创建吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await executeCreate(rules, dateStr)
      },
      onNegativeClick: () => {
        loading.value = false
      },
    })
    return
  }

  await executeCreate(rules, dateStr)
}

async function executeCreate(rules: any[], dateStr: string) {
  try {
    await $fetch('/api/teams', {
      method: 'POST',
      body: {
        name: name.value,
        description: description.value,
        rules,
        raid_date: dateStr,
      },
    })
    router.push('/dashboard')
  }
  catch {
    message.error('创建失败')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto pb-10 max-w-4xl">
    <div class="mb-8 flex gap-4 items-center">
      <button class="i-carbon-arrow-left text-2xl icon-btn" @click="router.back()" />
      <h1 class="title">
        创建新队伍
      </h1>
    </div>

    <div class="card space-y-6">
      <!-- Basic Info -->
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label class="text-gray-700 font-medium mb-2 block">队伍名称</label>
          <input v-model="name" class="text-lg input w-full" placeholder="例如：周二晚间固定团">
        </div>
        <div>
          <label class="text-gray-700 font-medium mb-2 block">简介 (选填)</label>
          <input v-model="description" class="text-lg input w-full" placeholder="简单描述一下...">
        </div>
      </div>

      <div>
        <label class="text-gray-700 font-medium mb-2 block">开团日期</label>
        <NDatePicker v-model:value="raidDateTs" type="date" class="w-full" />
      </div>

      <hr class="border-gray-200">

      <!-- Template Section -->
      <div class="p-4 border border-gray-100 rounded-lg bg-gray-50/50 flex gap-4 items-end">
        <div class="flex-1">
          <label class="text-sm text-teal-700 font-medium mb-2 block">使用模板</label>
          <NSelect v-model:value="selectedTemplate" :options="templateOptions" placeholder="选择模板" />
        </div>

        <div class="flex-1">
          <label class="text-sm text-gray-600 font-medium mb-2 block">保存当前配置为模板</label>
          <div class="flex gap-2">
            <input v-model="currentTemplateName" class="input w-full" placeholder="模板名称">
            <button :disabled="!currentTemplateName" class="btn-secondary whitespace-nowrap" @click="saveTemplate">
              保存
            </button>
          </div>
        </div>
      </div>

      <!-- Rules Grid -->
      <div>
        <h3 class="text-lg text-teal-700 font-medium mb-4">
          补贴规则设置
        </h3>

        <div class="gap-8 grid grid-cols-1 md:grid-cols-2">
          <!-- DPS Column -->
          <div class="space-y-4">
            <div class="mb-2 pb-2 border-b border-gray-100 flex gap-2 items-center">
              <div class="i-carbon-chart-line text-xl text-teal-500" />
              <span class="text-gray-700 font-bold">输出排名补贴 (DPS)</span>
            </div>

            <div v-for="rule in dpsRules" :key="rule.rank" class="flex gap-4 items-center">
              <div class="text-gray-600 font-medium font-mono w-24">
                第 {{ rule.rank }} 名
              </div>
              <div class="flex-1 relative">
                <span class="text-sm text-gray-400 left-3 top-1/2 absolute -translate-y-1/2">G</span>
                <input v-model="rule.amount" class="input text-teal-600 font-bold pl-8 w-full" placeholder="0">
              </div>
            </div>
          </div>

          <!-- Perf Column -->
          <div class="space-y-4">
            <div class="mb-2 pb-2 border-b border-gray-100 flex gap-2 items-center">
              <div class="i-carbon-favorite text-xl text-pink-500" />
              <span class="text-gray-700 font-bold">治疗/T 层数</span>
            </div>

            <div v-for="rule in perfRules" :key="rule.threshold" class="flex gap-4 items-center">
              <div class="flex gap-1 w-32 items-center">
                <span class="text-sm text-gray-600 font-medium whitespace-nowrap">层数</span>
                <input v-model="rule.threshold" type="number" class="text-sm input px-2 py-1 text-center w-16" placeholder="90">
                <span class="text-gray-600 font-medium">+</span>
              </div>
              <div class="flex-1 relative">
                <span class="text-sm text-gray-400 left-3 top-1/2 absolute -translate-y-1/2">G</span>
                <input v-model="rule.amount" type="number" class="input text-pink-600 font-bold pl-8 w-full" placeholder="0">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-gray-100 flex items-center justify-between">
        <div v-if="selectedTemplate" class="text-sm">
          <button class="text-red-400 underline hover:text-red-600" @click="() => deleteTemplate(templates.findIndex(x => x.name === selectedTemplate))">
            删除模板 "{{ selectedTemplate }}"
          </button>
        </div>
        <div v-else />

        <button :disabled="loading || !name" class="text-lg btn text-white px-8 bg-teal-600 shadow-none hover:bg-teal-700" @click="createTeam">
          {{ loading ? '创建中...' : '创建队伍' }}
        </button>
      </div>
    </div>
  </div>
</template>
