<script setup lang="ts">
import dayjs from 'dayjs'

const userStore = useUserStore()

definePageMeta({
  middleware: 'auth',
})

// My Teams
const { data: myTeams, refresh } = await useFetch('/api/teams', {
  key: 'my-teams',
})

// My Weekly Stats
const { data: myStats } = await useFetch('/api/stats/weekly', {
  query: { week: getThisMonday() },
})

function getThisMonday() {
  // Dayjs handles Monday start correctly with .startOf('week') if locale is set, or manual calculation
  // Default dayjs start of week is Sunday.
  // Let's settle on ISO 8601 week (Monday start) or manual.
  // Manual manual ensuring Monday:
  const d = dayjs()
  const day = d.day() // 0 is Sunday
  const diff = d.date() - day + (day === 0 ? -6 : 1)
  return d.date(diff).format('YYYY-MM-DD')
}
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <h1 class="title">
        工作台
      </h1>
      <div class="flex gap-4">
        <NuxtLink to="/overview" class="btn-secondary decoration-none flex gap-2 items-center">
          <div class="i-carbon-chart-bar" /> 数据总览
        </NuxtLink>
        <NuxtLink to="/create-team" class="btn decoration-none flex gap-2 items-center">
          <div class="i-carbon-add" /> 创建队伍
        </NuxtLink>
      </div>
    </div>

    <div v-if="userStore.user">
      <!-- Personal Weekly Summary -->
      <!-- Personal Weekly Summary -->
      <div class="mb-10">
        <h2 class="text-xl text-gray-800 font-bold mb-4 flex gap-2 items-center dark:text-gray-100">
          <div class="i-carbon-user-identification text-teal-600" />
          本周个人收益
        </h2>

        <div v-if="myStats && myStats.find(u => u.user_id === userStore.user.id)" class="p-6 border border-gray-200 rounded-xl bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500 mb-1">
                本周累计补贴
              </div>
              <div class="text-4xl text-teal-600 font-bold">
                {{ myStats.find(u => u.user_id === userStore.user.id).total_amount }} G
              </div>
            </div>
            <!-- Mini Breakdown -->
            <div class="flex gap-4">
              <div v-for="record in myStats.find(u => u.user_id === userStore.user.id).breakdown" :key="record.id" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ record.team_name }}
                </div>
                <div class="text-gray-800 font-bold dark:text-gray-200">
                  +{{ record.subsidy_amount }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 p-6 text-center border border-gray-200 rounded-xl border-dashed bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          本周暂无收益记录
        </div>
      </div>

      <div class="gap-6 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
        <!-- New Team Card -->
        <!-- <div class="card flex flex-col items-center justify-center p-8 border-dashed border-2 border-gray-300 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition-all group min-h-[220px]" @click="navigateTo('/create-team')">
           <div class="i-carbon-add-filled text-5xl text-gray-300 group-hover:text-teal-500 mb-4 transition-colors scale-100 group-hover:scale-110 duration-300" />
           <span class="font-medium text-lg text-gray-500 group-hover:text-teal-600">创建新队伍</span>
        </div> -->

        <!-- Existing Teams -->
        <div v-for="team in myTeams" :key="team.id" class="group card border-l-4 border-l-teal-500 flex flex-col cursor-pointer transition-all hover:shadow-xl" @click="navigateTo(`/team/${team.id}`)">
          <div class="mb-2 flex items-start justify-between">
            <h2 class="text-xl text-gray-800 font-bold transition-colors dark:text-gray-100 group-hover:text-teal-600">
              {{ team.name }}
            </h2>
            <div class="text-xs text-gray-500 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              已加入
            </div>
          </div>
          <p class="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">
            {{ team.description || '暂无简介' }}
          </p>

          <div class="text-sm text-gray-400 mt-auto pt-4 border-t border-gray-100 flex gap-4 items-center dark:border-gray-700">
            <div class="flex gap-1 items-center">
              <div class="i-carbon-user-multiple" /> {{ team.member_count }} 成员
            </div>
            <div class="flex gap-1 items-center">
              <div class="i-carbon-calendar" /> {{ team.raid_date || new Date(team.created_at).toLocaleDateString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
