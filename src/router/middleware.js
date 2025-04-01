import { useAuthStore } from '@/stores/AuthStore'

export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!authStore.isAuthenticated) {
        next({
          path: '/login',
          query: { redirect: to.fullPath },
        })
      } else {
        next()
      }
    } else {
      next()
    }
  })
}
