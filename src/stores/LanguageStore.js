import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import i18n from '@/i18n'
import api from '@/api'

/* global window, localStorage, console, EventSource, setTimeout */

export const useLanguageStore = defineStore('language', () => {
  const translations = ref({})
  const currentLanguage = ref(window.localStorage.getItem('language') || 'en')
  const isLoaded = ref(false)
  const locales = ref(['en', 'ru'])

  // Translation state
  const translationProgress = ref(0)
  const translationStatus = ref('idle') // idle, processing, completed, failed
  const translationMessage = ref('')

  let currentEventSource = null // For storing current connection

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

  // Добавляем функции для управления прогрессом
  function setTranslationProgress(progress) {
    translationProgress.value = progress
  }

  function setTranslationStatus(status) {
    translationStatus.value = status
  }

  function setTranslationMessage(message) {
    translationMessage.value = message
  }

  function resetTranslationState() {
    translationProgress.value = 0
    translationStatus.value = 'idle'
    translationMessage.value = ''
  }

  async function setLanguage(lang) {
    try {
      const response = await api.get(`/i18n/translations/${lang}`)
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
      console.log('Отправляем запрос на:', `/i18n/translate-language/${langCode}`)
      const response = await api.post(`/i18n/translate-language/${langCode}`)
      console.log('Получили ответ:', response.data)
      return true
    } catch (error) {
      console.error('Ошибка запроса:', error.response || error)
      throw error
    }
  }

  // Добавляем функцию отмены
  function cancelTranslation() {
    if (currentEventSource) {
      currentEventSource.close()
      currentEventSource = null
      setTranslationStatus('idle')
      setTranslationMessage('')
      setTranslationProgress(0)
    }
  }

  function changeLanguage(lang) {
    setLanguage(lang)
  }

  async function fetchLocales() {
    try {
      const response = await api.get('/i18n/locales')
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
    translationProgress,
    translationStatus,
    translationMessage,
    setLanguage,
    initializeLanguage,
    addLanguage,
    changeLanguage,
    currentTranslations,
    fetchLocales,
    setTranslationProgress,
    setTranslationStatus,
    setTranslationMessage,
    resetTranslationState,
    cancelTranslation,
  }
})
