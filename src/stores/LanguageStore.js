import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref('en')
  const isLoading = ref(false)

  const initializeLanguage = () => {
    // Всегда устанавливаем английский как базовый
    currentLanguage.value = 'en'
    i18n.global.locale.value = 'en'
    document.querySelector('html').setAttribute('lang', 'en')
  }

  const setLanguage = async (lang) => {
    // Пока всегда возвращаемся к английскому
    console.log(`Language change requested to: ${lang}. Currently only English is supported.`)
    currentLanguage.value = 'en'
    i18n.global.locale.value = 'en'
    document.querySelector('html').setAttribute('lang', 'en')
    return true
  }

  return {
    currentLanguage,
    isLoading,
    setLanguage,
    initializeLanguage,
  }
})
