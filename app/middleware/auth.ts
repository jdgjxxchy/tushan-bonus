export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore()
  if (!userStore.user) {
    await userStore.fetchUser()
    if (!userStore.user) {
      return navigateTo('/')
    }
  }
})
