import { useUserStore } from '@/stores/UserStore'

export function setupRouteGuards(router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // Проверка требований к роли
    if (to.meta.roles) {
      const userRole = userStore.userData?.role || 'guest'
      if (!to.meta.roles.includes(userRole)) {
        next({ name: 'profile' }) // Редирект на основной профиль
        return
      }
    }

    next()
  })
}
