import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref(localStorage.getItem('language') || 'ru')

  const setLanguage = (lang) => {
    currentLanguage.value = lang
    i18n.global.locale.value = lang
    localStorage.setItem('language', lang)
    document.querySelector('html').setAttribute('lang', lang)
  }

  // Инициализация языка при загрузке приложения
  const initializeLanguage = () => {
    const savedLang = localStorage.getItem('language') || 'ru'
    setLanguage(savedLang)
  }

  return {
    currentLanguage,
    setLanguage,
    initializeLanguage,
  }
})
