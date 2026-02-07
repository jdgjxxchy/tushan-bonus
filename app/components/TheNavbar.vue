<script setup lang="ts">
const userStore = useUserStore()
const message = useMessage()

const editingName = ref(false)
const newName = ref('')

function startEdit() {
  newName.value = userStore.user?.nickname || ''
  editingName.value = true
}

async function saveName() {
  if (!editingName.value)
    return

  const trimmed = newName.value.trim()
  if (!trimmed || trimmed === userStore.user?.nickname) {
    editingName.value = false
    return
  }

  try {
    await $fetch('/api/user', {
      method: 'PATCH',
      body: { nickname: trimmed },
    })
    if (userStore.user) {
      userStore.user.nickname = trimmed
    }
    message.success('昵称更新成功')
  }
  catch {
    message.error('更新失败')
  }
  finally {
    editingName.value = false
  }
}

// Custom directive for focus
const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
}
</script>

<template>
  <nav class="mx-4 mb-6 mt-4 card px-6 py-4 flex items-center justify-between">
    <NuxtLink :to="userStore.user ? '/dashboard' : '/'" class="decoration-none flex gap-4 items-center">
      <div class="i-carbon-game-console text-3xl text-teal-500" />
      <span class="text-xl text-teal-600 font-bold font-display">
        兔扇补贴登记
      </span>
    </NuxtLink>
    <div class="flex gap-4 items-center">
      <NuxtLink to="/dashboard" class="text-gray-600 font-medium decoration-none transition-colors hover:text-teal-600">
        工作台
      </NuxtLink>
      <div class="bg-gray-200 h-6 w-1px" />

      <div v-if="userStore.user" class="flex gap-4 items-center">
        <div class="flex gap-2 items-center">
          <img :src="userStore.user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'" class="border border-teal-200 rounded-full h-8 w-8">

          <div v-if="editingName" class="flex gap-2 items-center">
            <input
              v-model="newName"
              v-focus
              class="text-sm px-2 py-0.5 outline-none border border-teal-400 rounded w-32"
              @blur="saveName"
              @keyup.enter="saveName"
            >
          </div>
          <span
            v-else
            class="text-gray-700 font-medium cursor-pointer transition-colors hover:text-teal-600"
            title="点击修改昵称"
            @click="startEdit"
          >
            {{ userStore.user.nickname }}
          </span>
        </div>
        <button class="icon-btn text-gray-500 flex gap-1 items-center hover:text-red-600" title="退出登录" @click="userStore.logout()">
          <div class="i-carbon-logout text-xl" />
        </button>
      </div>
    </div>
  </nav>
</template>
