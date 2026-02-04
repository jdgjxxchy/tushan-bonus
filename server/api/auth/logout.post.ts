export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_user_id')
  return { success: true }
})
