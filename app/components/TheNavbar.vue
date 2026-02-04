<script setup lang="ts">
const userStore = useUserStore()
</script>

<template>
  <nav class="flex items-center justify-between px-6 py-4 card mb-6 mx-4 mt-4">
    <NuxtLink to="/" class="flex items-center gap-4 decoration-none">
      <div class="i-carbon-game-console text-3xl text-teal-500" />
      <span class="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
        兔扇补贴登记
      </span>
    </NuxtLink>
    <div class="flex items-center gap-4">
       <NuxtLink to="/dashboard" class="text-gray-600 hover:text-teal-600 font-medium transition-colors decoration-none">
         工作台
       </NuxtLink>
       <div class="w-1px h-6 bg-gray-200 dark:bg-gray-700" />
       
       <div v-if="userStore.user" class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <img :src="userStore.user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'" class="w-8 h-8 rounded-full border border-teal-200" />
            <span class="font-medium text-gray-700">{{ userStore.user.nickname }}</span>
          </div>
          <button class="icon-btn text-gray-500 hover:text-red-600 flex items-center gap-1" title="退出登录" @click="userStore.logout()">
            <div class="i-carbon-logout text-xl" />
          </button>
       </div>
    </div>
  </nav>
</template>
