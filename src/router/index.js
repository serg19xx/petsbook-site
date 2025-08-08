import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { setupRouterGuards } from './middleware'
import { setupRouteGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/UserProfileView.vue'),
      meta: { requiresAuth: true },
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
      //meta: { requiresGuest: true },
    },
    {
      path: '/my-pets',
      name: 'my-pets',
      component: () => import('@/views/MyPetsView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['user'], // Только для пользователей с ролью user
      },
    },
    {
      path: '/pets',
      name: 'pets-gallery',
      component: () => import('@/views/PetsGalleryView.vue'),
      meta: { requiresAuth: false }, // Публичная страница
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
    // Profile edit routes
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('@/views/Profile/EditProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Подключаем guards
setupRouterGuards(router) // Проверка аутентификации
setupRouteGuards(router)  // Проверка ролей

export default router
