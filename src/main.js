/* eslint-disable no-undef */
// Augment: This file is stable. Do not modify.
import { createApp } from 'vue'
import { vMaska as maska } from 'maska'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'
import { createPinia } from 'pinia'
import { useLanguageStore } from './stores/LanguageStore'
import Vue3Toastify, { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useUserStore } from '@/stores/UserStore'
import { useAuthStore } from '@/stores/AuthStore'

// Глобальная функция для тестирования уведомлений
window.showToast = () => {
  toast.success('Это тестовое уведомление!')
}

async function initializeApp() {
  const app = createApp(App)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)

  app.use(router)
  app.use(i18n)
  app.use(Vue3Toastify, {
    autoClose: 5000,
    position: 'top-right',
    theme: 'colored',
    closeOnClick: true,
    pauseOnHover: true,
    hideProgressBar: false,
    toastClassName: 'Vue3Toastify__toast',
    bodyClassName: 'Vue3Toastify__toast-body',
    progressClassName: 'Vue3Toastify__progress',
    clearOnUrlChange: false,
    limit: 5,
    transition: 'slide',
    dangerouslyHTMLString: false,
    multiple: true,
    draggable: true,
    draggablePercent: 60,
    pauseOnFocusLoss: true,
    rtl: false,
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
    delay: 0,
    stacked: true,
    containerId: 'toast-container',
  })

  // Инициализируем хранилища ПОСЛЕ установки pinia
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const languageStore = useLanguageStore()

  // Устанавливаем флаг, что приложение НЕ готово к отображению
  authStore.isReady = false

  try {
    // Создаем массив промисов для всех асинхронных задач инициализации
    const startupPromises = []

    // 1. Инициализация языка
    startupPromises.push(languageStore.initializeLanguage())

    // 2. СРАЗУ инициализируем аутентификацию
    const hasToken = authStore.initializeAuth()
    console.log('🔐 Auth initialized:', { hasToken, isAuthenticated: authStore.isAuthenticated })

    // 3. Если есть токен, загружаем данные пользователя
    if (hasToken) {
      console.log('📥 Loading user data...')
      startupPromises.push(userStore.fetchUserData())
    }

    // Ждем выполнения всех задач
    await Promise.all(startupPromises)

    console.log('✅ App initialization completed:', {
      isAuthenticated: authStore.isAuthenticated,
      userRole: userStore.userData?.role,
      hasToken: hasToken,
    })
  } catch (error) {
    console.error('❌ Ошибка инициализации приложения:', error)
  } finally {
    // Вне зависимости от успеха/ошибки, сообщаем, что инициализация завершена
    authStore.isReady = true
    console.log('🚀 App ready, mounting...')

    // Монтируем приложение только СЕЙЧАС, когда все готово
    app.mount('#app')
  }
}

// Запускаем инициализацию
initializeApp()
