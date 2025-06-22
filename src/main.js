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

// Инициализируем язык до монтирования приложения
console.log('main.js: before language init')
const languageStore = useLanguageStore()
await languageStore.setLanguage(languageStore.currentLanguage)
console.log('main.js: after language init')

// Асинхронная инициализация
async function initApp() {
  try {
    // 1. Ждем, пока загрузятся данные пользователя
    await userStore.fetchUserData()
  } catch (error) {
    console.error('Failed to initialize user data:', error)
  } finally {
    // 2. Только после этого монтируем приложение
    app.mount('#app')
  }
}

// Запускаем инициализацию
initApp()