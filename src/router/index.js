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
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
    },
    {
      path: '/recovery', // Изменили путь с /password-recovery на /recovery
      name: 'password-recovery',
      component: () => import('@/views/auth/PasswordRecoveryView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/settings/security',
      name: 'security-settings',
      component: () => import('@/components/security/SecuritySettings.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Временно отключаем проверку аутентификации для разработки
router.beforeEach((to, from, next) => {
  next()
})

export default router
