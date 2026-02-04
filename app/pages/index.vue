<script setup lang="ts">
const userStore = useUserStore()
const router = useRouter()

const qqId = ref('')
const nickname = ref('')
const loading = ref(false)

onMounted(async () => {
  await userStore.fetchUser()
  if (userStore.user) {
    router.push('/dashboard')
  }
})

async function handleLogin() {
  if (!qqId.value || !nickname.value)
    return
  loading.value = true
  try {
    await userStore.login(qqId.value, nickname.value)
    router.push('/dashboard')
  }
  catch (e) {
    alert('Login failed')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col min-h-[60vh] items-center justify-center">
    <div class="card p-8 text-center max-w-md w-full">
      <div class="i-carbon-game-console text-6xl text-teal-600 mx-auto mb-4" />
      <h1 class="text-3xl text-teal-600 font-bold font-display mb-2">
        兔扇补贴系统
      </h1>
      <p class="text-gray-500 font-sans mb-8">
        简单的团队补贴管理工具
      </p>

      <form class="space-y-5" @submit.prevent="handleLogin">
        <div>
          <input
            v-model="qqId"
            type="text"
            placeholder="请输入 QQ 号"
            class="text-lg input text-center border-gray-200 bg-gray-50 w-full"
            required
          >
        </div>
        <div>
          <input
            v-model="nickname"
            type="text"
            placeholder="请输入您的昵称"
            class="text-lg input text-center border-gray-200 bg-gray-50 w-full"
            required
          >
        </div>

        <button
          type="submit"
          class="text-lg btn text-white font-medium bg-teal-600 flex gap-2 w-full shadow-none items-center justify-center hover:bg-teal-700"
          :disabled="loading"
        >
          <div v-if="loading" class="i-carbon-circle-dash text-xl animate-spin" />
          <span v-else>开始使用</span>
        </button>
      </form>

      <div class="text-xs text-gray-400 mt-6">
        * 输入 QQ 号和昵称即可快速注册/登录
      </div>
    </div>
  </div>
</template>
