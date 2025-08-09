import { useUserStore } from '@/stores/UserStore'
import { useAuthStore } from '@/stores/AuthStore'

export function setupRouteGuards(router) {
  router.beforeEach(async (to, from, next) => {
    // Просто пропускаем все - никаких проверок ролей
    next()
  })
}
