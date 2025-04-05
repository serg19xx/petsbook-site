import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/recovery',
      name: 'password-recovery',
      component: () => import('@/views/auth/PasswordRecoveryView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/verify-email/:token',
      name: 'EmailVerification',
      component: () => import('@/views/auth/EmailVerification.vue'),
    },
    {
      path: '/settings/security',
      name: 'security-settings',
      component: () => import('@/components/security/SecuritySettings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
      meta: { requiresGuest: true }, // Доступно только для неавторизованных пользователей
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// Настраиваем защиту роутов
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Если маршрут требует аутентификации и пользователь не авторизован
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Если маршрут только для гостей и пользователь авторизован
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
