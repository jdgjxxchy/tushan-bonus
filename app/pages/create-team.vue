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

// Custom Rule Logic
const rules = ref([
  { id: Math.random().toString(36).slice(2, 9), name: 'DPS 前六', amount: 1000, category: 'dps' },
  { id: Math.random().toString(36).slice(2, 9), name: '奶妈层数 90+', amount: 500, category: 'support' },
])

function addRule() {
  rules.value.push({
    id: Math.random().toString(36).slice(2, 9),
    name: '',
    amount: 0,
    category: 'dps',
  })
}

function removeRule(index: number) {
  rules.value.splice(index, 1)
}

// Templates
const templates = useLocalStorage('rule-templates', [] as { name: string, rules: any[] }[])
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
    rules: JSON.parse(JSON.stringify(rules.value)),
  }

  if (existing >= 0) {
    dialog.warning({
      title: '确认覆盖',
      content: '该模板名称已存在，是否作为副本创建？(取消则覆盖现有模板)',
      positiveText: '作为副本',
      negativeText: '覆盖现有',
      onPositiveClick: () => {
        templates.value.push({ ...templateData, name: `${templateData.name} (副本)` })
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
    rules.value = JSON.parse(JSON.stringify(t.rules))
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

  // Basic check
  if (rules.value.length === 0) {
    dialog.warning({
      title: '确认发布',
      content: '未设置任何补贴规则，确定要创建吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await executeCreate(rules.value, dateStr)
      },
      onNegativeClick: () => {
        loading.value = false
      },
    })
    return
  }

  await executeCreate(rules.value, dateStr)
}

async function executeCreate(finalRules: any[], dateStr: string) {
  try {
    await $fetch('/api/teams', {
      method: 'POST',
      body: {
        name: name.value,
        description: description.value,
        rules: finalRules.map(r => ({
          ...r,
          type: 'custom', // Mark as custom to distinguish in processing
        })),
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
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg text-teal-700 font-medium">
            补贴项目设置
          </h3>
          <button class="btn-secondary flex gap-1 items-center" @click="addRule">
            <div class="i-carbon-add" /> 添加项目
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="(rule, index) in rules" :key="rule.id" class="p-4 border border-gray-100 rounded-xl bg-white flex gap-4 transition-all items-center hover:border-teal-200">
            <div class="w-32">
              <NSelect
                v-model:value="rule.category"
                :options="[
                  { label: '输出', value: 'dps' },
                  { label: '奶/T', value: 'support' },
                ]"
              />
            </div>
            <div class="flex-1">
              <input v-model="rule.name" class="input w-full" placeholder="项目名称，如：DPS 前六">
            </div>
            <div class="w-32 relative">
              <input v-model="rule.amount" class="input font-bold pl-8 w-full" placeholder="金额">
              <span class="text-sm text-gray-400 right-3 top-1/2 absolute -translate-y-1/2">G</span>
            </div>
            <button class="text-red-400 p-2 rounded-lg hover:text-red-600 hover:bg-red-50" @click="removeRule(index)">
              <div class="i-carbon-trash-can" />
            </button>
          </div>

          <div v-if="rules.length === 0" class="text-gray-400 py-10 text-center border-2 border-gray-50 rounded-xl border-dashed">
            点击右上方按钮添加补贴项目
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
