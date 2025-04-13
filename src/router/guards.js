import { useUserStore } from '@/stores/UserStore'

export function setupRouteGuards(router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // Проверка требований к роли
    if (to.meta.requiresRole && userStore.userRole !== to.meta.requiresRole) {
      next({ name: 'profile' }) // Редирект на основной профиль
      return
    }

    next()
  })
}
