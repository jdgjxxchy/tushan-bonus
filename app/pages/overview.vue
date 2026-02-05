<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({
  middleware: 'auth',
})

// Week Calculation
const currentWeekOffset = ref(0)
const weekStart = computed(() => {
  let d = dayjs().add(currentWeekOffset.value, 'week')
  const day = d.day() // 0 is Sunday
  const diff = d.date() - day + (day === 0 ? -6 : 1)
  return d.date(diff).format('YYYY-MM-DD')
})

const displayWeek = computed(() => {
  const start = dayjs(weekStart.value)
  const end = start.add(6, 'day')
  return `${start.format('M/D')} - ${end.format('M/D')}`
})

// Data Fetching
const { data: stats, refresh } = await useFetch('/api/stats/weekly', {
  query: { week: weekStart },
})

const loading = ref(false)

async function changeWeek(offset: number) {
  currentWeekOffset.value += offset
  // refresh triggers automatically due to reactive query
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-8 flex items-center justify-between">
      <div class="flex gap-4 items-center">
        <button class="i-carbon-arrow-left text-2xl icon-btn" @click="navigateTo('/dashboard')" />
        <h1 class="title">
          数据总览
        </h1>
      </div>

      <div class="p-1 border border-gray-200 rounded-lg bg-white flex gap-4 shadow-sm items-center dark:border-gray-700 dark:bg-black">
        <button class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="changeWeek(-1)">
          <div class="i-carbon-chevron-left" />
        </button>
        <div class="font-bold font-mono px-4 text-center min-w-[200px]">
          {{ displayWeek }}
        </div>
        <button class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="changeWeek(1)">
          <div class="i-carbon-chevron-right" />
        </button>
      </div>
    </div>

    <div v-if="stats && stats.length > 0" class="gap-6 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
      <div v-for="user in stats" :key="user.user_id" class="group card border-t-4 border-t-teal-500 transition-all relative hover:shadow-xl">
        <div class="mb-4 flex gap-4 items-center">
          <img :src="user.avatar_url" class="border-2 border-white rounded-full h-12 w-12 shadow-sm">
          <div>
            <div class="text-lg font-bold">
              {{ user.nickname }}
            </div>
            <div class="text-xs text-gray-400 font-mono">
              {{ user.qq_id }}
            </div>
          </div>
          <div class="text-2xl text-teal-600 font-bold ml-auto">
            {{ user.total_amount }} G
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 space-y-2 dark:border-gray-700">
          <div v-for="record in user.breakdown" :key="record.id" class="text-sm flex items-center justify-between">
            <div class="text-gray-600 flex gap-2 items-center dark:text-gray-300">
              <div class="rounded-full bg-teal-400 h-2 w-2" />
              <span>{{ record.team_name }}</span>
            </div>
            <div class="font-medium font-mono">
              {{ record.subsidy_amount }}
            </div>
          </div>
        </div>

        <!-- Tooltip / Hover Detail (implied by layout or can be explicit) -->
        <!-- Currently showing inline breakdown for better visibility -->
      </div>
    </div>

    <div v-else class="py-20 text-center border border-gray-200 rounded-xl border-dashed bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
      <div class="i-carbon-chart-bar text-6xl text-gray-200 mx-auto mb-4" />
      <p class="text-lg text-gray-500">
        本周暂无数据
      </p>
    </div>
  </div>
</template>
