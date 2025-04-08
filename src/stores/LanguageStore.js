import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref('en')
  const isLoading = ref(false)

  const initializeLanguage = () => {
    currentLanguage.value = 'en'
    i18n.global.locale.value = 'en'
    document.querySelector('html').setAttribute('lang', 'en')
  }

  const setLanguage = async () => {
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
