// Augment: This file is stable. Do not modify.
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'
import { useLanguageStore } from './stores/LanguageStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Инициализация языка после создания store
const languageStore = useLanguageStore()
languageStore.initializeLanguage()

app.mount('#app')
