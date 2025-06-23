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

// Глобальная функция для тестирования уведомлений
window.showToast = () => {
  toast.success('Это тестовое уведомление!')
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

//const authStore = useAuthStore()
//const userStore = useUserStore()

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

// Создаем экземпляр UserStore
const userStore = useUserStore()
const languageStore = useLanguageStore()

// Оборачиваем всю асинхронную логику в async-функцию
async function initializeApp() {
  // Инициализируем язык до монтирования приложения
  console.log('main.js: before language init')
  await languageStore.setLanguage(languageStore.currentLanguage)
  console.log('main.js: after language init')

  // Проверяем, есть ли токен, перед загрузкой данных пользователя
  if (document.cookie.includes('auth_token=')) {
    try {
      await userStore.fetchUserData()
    } catch (error) {
      console.error('Failed to initialize user data on startup:', error)
    }
  }

  // Монтируем приложение только после всей инициализации
  app.mount('#app')
}

// Запускаем инициализацию
initializeApp()