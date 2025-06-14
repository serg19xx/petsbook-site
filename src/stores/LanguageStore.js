import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import i18n from '@/i18n'
import axios from 'axios'

export const useLanguageStore = defineStore('language', () => {
  const translations = ref({})
  const currentLanguage = ref(localStorage.getItem('language') || 'en')
  const isLoaded = ref(false)
  const locales = ref(['en', 'ru'])

  const currentTranslations = computed(() => translations.value[currentLanguage.value] || {})

  function flatToNested(flatObj) {
    const nested = {}

    // Сначала сортируем ключи по длине (от коротких к длинным)
    const sortedKeys = Object.keys(flatObj).sort((a, b) => a.length - b.length)

    for (const flatKey of sortedKeys) {
      const value = flatObj[flatKey]
      const keys = flatKey.split('.')
      let current = nested

      // Проходим по всем ключам кроме последнего
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!current[key]) {
          current[key] = {}
        }
        current = current[key]
      }

      // Обрабатываем последний ключ
      const lastKey = keys[keys.length - 1]
      current[lastKey] = value
    }

    return nested
  }

  async function setLanguage(lang) {
    try {
      const response = await axios.get(`/api/i18n/translations/${lang}`)
      const responseData = response.data

      if (responseData.status !== 200) {
        console.error('API returned error:', responseData.message)
        return null
      }

      const { data } = responseData

      // Создаем объект для всех переводов
      const newTranslations = {}

      // Проверяем наличие translations и обрабатываем только существующие секции
      if (data.translations) {
        Object.entries(data.translations).forEach(([namespace, items]) => {
          newTranslations[namespace] = items
        })
      }

      // Устанавливаем локаль и сообщения
      i18n.global.locale.value = lang
      i18n.global.setLocaleMessage(lang, newTranslations)

      translations.value = newTranslations
      currentLanguage.value = lang
      console.log('==== currentLanguage', currentLanguage.value)
      console.log('currentLanguage:', currentLanguage.value)
      console.log('translations:', translations.value)
      isLoaded.value = true
      localStorage.setItem('language', lang)

      console.log('Loading translations for:', currentLanguage)
      console.log('Translations loaded:', translations)

      return newTranslations
    } catch (error) {
      console.error('Error loading translations:', error)
    }
  }

  async function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'en'
    return await setLanguage(savedLanguage)
  }

  async function addLanguage(langCode) {
    try {
      const response = await axios.post(`/api/i18n/translate-language/${langCode}`)
      const data = response.data
      if (data.status !== 200) {
        throw new Error(data.message || 'Failed to add language')
      }
      return true
    } catch (error) {
      console.error('Failed to add language:', error)
      throw error
    }
  }

  function changeLanguage(lang) {
    setLanguage(lang)
  }

  async function fetchLocales() {
    try {
      const response = await axios.get('/api/i18n/locales')
      locales.value = response.data.locales // например: [{ code: 'en', label: 'English' }, ...]
    } catch (error) {
      console.error('Failed to fetch locales:', error)
    }
  }

  return {
    currentLanguage,
    translations,
    isLoaded,
    locales,
    setLanguage,
    initializeLanguage,
    addLanguage,
    changeLanguage,
    currentTranslations,
    fetchLocales,
  }
})

