import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null)
  
  async function fetchUser() {
    try {
      const data = await $fetch('/api/user')
      user.value = data
    } catch (e) {
      user.value = null
    }
  }

  async function login(qq_id: string, nickname: string) {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { qq_id, nickname }
    })
    user.value = data
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    return navigateTo('/')
  }

  return {
    user,
    fetchUser,
    login,
    logout
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
