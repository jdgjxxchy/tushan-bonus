<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({
  middleware: 'auth'
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
  query: { week: weekStart }
})

const loading = ref(false)

async function changeWeek(offset: number) {
  currentWeekOffset.value += offset
  // refresh triggers automatically due to reactive query
}
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-8">
       <div class="flex items-center gap-4">
         <button @click="navigateTo('/dashboard')" class="icon-btn text-2xl i-carbon-arrow-left" />
         <h1 class="title">数据总览</h1>
       </div>
       
       <div class="flex items-center gap-4 bg-white dark:bg-black p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
         <button @click="changeWeek(-1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
           <div class="i-carbon-chevron-left" />
         </button>
         <div class="font-mono font-bold px-4 min-w-[200px] text-center">
           {{ displayWeek }}
         </div>
         <button @click="changeWeek(1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" :disabled="currentWeekOffset >= 0">
           <div class="i-carbon-chevron-right" />
         </button>
       </div>
    </div>

    <div v-if="stats && stats.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <div v-for="user in stats" :key="user.user_id" class="card group hover:shadow-xl transition-all border-t-4 border-t-teal-500 relative">
          <div class="flex items-center gap-4 mb-4">
             <img :src="user.avatar_url" class="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
             <div>
               <div class="font-bold text-lg">{{ user.nickname }}</div>
               <div class="text-xs text-gray-400 font-mono">{{ user.qq_id }}</div>
             </div>
             <div class="ml-auto text-2xl font-bold text-teal-600">
               {{ user.total_amount }} G
             </div>
          </div>
          
          <div class="space-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <div v-for="record in user.breakdown" :key="record.id" class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                   <div class="w-2 h-2 rounded-full bg-teal-400" />
                   <span>{{ record.team_name }}</span>
                </div>
                <div class="font-mono font-medium">{{ record.subsidy_amount }}</div>
             </div>
          </div>
          
          <!-- Tooltip / Hover Detail (implied by layout or can be explicit) -->
          <!-- Currently showing inline breakdown for better visibility -->
       </div>
    </div>
    
    <div v-else class="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
       <div class="i-carbon-chart-bar text-6xl text-gray-200 mb-4 mx-auto" />
       <p class="text-gray-500 text-lg">本周暂无数据</p>
    </div>
  </div>
</template>
