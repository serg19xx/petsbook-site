import { useAuthStore } from '@/stores/AuthStore'

export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.matched.some((record) => record.meta.requiresAuth)) {
      const hasToken = document.cookie.includes('auth_token=')
      const isAuthenticated = authStore.isAuthenticated
      const hasLoginInfo = !!authStore.loginInfo

      console.log('Auth check:', {
        route: to.name,
        hasToken,
        isAuthenticated,
        hasLoginInfo,
        requiresAuth: true,
      })

      // Проверяем либо токен, либо состояние аутентификации, либо сохранённую информацию о логине
      if (!hasToken && !isAuthenticated && !hasLoginInfo) {
        console.log('Redirecting to login - no token, not authenticated, and no login info')
        next('/login')
      } else {
        // Если есть любой из признаков аутентификации, но флаг не установлен - устанавливаем
        if ((hasToken || hasLoginInfo) && !isAuthenticated) {
          console.log('Has auth credentials but not authenticated - fixing state')
          authStore.isAuthenticated = true
        }
        next()
      }
    } else {
      next()
    }
  })
}
