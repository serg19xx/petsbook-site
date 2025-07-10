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
    console.log('flatToNested called with:', flatObj)

    // Проверяем входные данные
    if (!flatObj || typeof flatObj !== 'object') {
      console.error('Invalid input to flatToNested:', flatObj)
      return null
    }

    try {
      const nested = {}
      console.log('Created nested object')

      // Получаем ключи
      const keys = Object.keys(flatObj)
      console.log('Total keys to process:', keys.length)

      if (keys.length === 0) {
        console.log('No keys to process, returning empty object')
        return nested
      }

      // Обрабатываем каждый ключ
      for (let i = 0; i < keys.length; i++) {
        const flatKey = keys[i]
        console.log(`Processing key ${i + 1}/${keys.length}:`, flatKey)

        try {
          const value = flatObj[flatKey]
          const keyParts = flatKey.split('.')
          let current = nested

          // Создаем вложенную структуру
          for (let j = 0; j < keyParts.length - 1; j++) {
            const part = keyParts[j]
            if (!current[part]) {
              current[part] = {}
            }
            current = current[part]
          }

          // Устанавливаем значение
          const lastPart = keyParts[keyParts.length - 1]
          current[lastPart] = value
          console.log(`Successfully processed: ${flatKey} -> ${value}`)
        } catch (keyError) {
          console.error(`Error processing key "${flatKey}":`, keyError)
          // Продолжаем обработку других ключей
        }
      }

      console.log('All keys processed successfully')
      console.log('Final nested object keys:', Object.keys(nested))
      return nested
    } catch (error) {
      console.error('Critical error in flatToNested:', error)
      console.error('Error stack:', error.stack)
      return null
    }
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
    console.log('setLanguage called with:', lang)
    try {
      console.log('Перед await api.get')
      const response = await api.get(`/api/i18n/translations/${lang}`)
      console.log('После await, API response:', response)
      const responseData = response.data
      console.log('API responseData:', responseData)
      if (responseData.status !== 200) {
        console.error('API returned error:', responseData.message)
        return null
      }
      const { data } = responseData
      let newTranslations = {}
      console.log(
        'data.translations:',
        data.translations,
        typeof data.translations,
        Array.isArray(data.translations),
      )
      if (data.translations) {
        console.log('data:', data)
        console.log('Translations before flatToNested:', data.translations)
        const nested = flatToNested(data.translations)
        console.log('flatToNested output:', nested)
        console.log('nested type:', typeof nested)
        console.log('nested keys:', nested ? Object.keys(nested) : 'nested is null/undefined')
        newTranslations = nested
        console.log('Translations after flatToNested:', newTranslations)

        if (nested) {
          console.log('Setting locale message for:', lang)
          i18n.global.setLocaleMessage(lang, nested)
          console.log('en messages:', i18n.global.getLocaleMessage('en'))
          console.log('Current locale before setting:', i18n.global.locale.value)

          // Устанавливаем локаль
          i18n.global.locale.value = lang
          console.log('Current locale after setting:', i18n.global.locale.value)
        } else {
          console.error('nested is null/undefined, cannot set locale message')
        }
      } else {
        console.warn('data.translations отсутствует или пустой!', data)
      }
      translations.value = newTranslations
      currentLanguage.value = lang
      isLoaded.value = true
      localStorage.setItem('language', lang)
      return newTranslations
    } catch (error) {
      console.error('Error in setLanguage:', error)
    }
  }

  async function initializeLanguage() {
    console.log('Calling initializeLanguage...')
    const savedLanguage = localStorage.getItem('language') || 'en'
    return await setLanguage(savedLanguage)
  }

  async function addLanguage(langCode) {
    try {
      console.log('Отправляем запрос на:', `/api/i18n/translate-language/${langCode}`)
      const response = await api.post(`/api/i18n/translate-language/${langCode}`)
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
      const response = await api.get('/api/i18n/locales')
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
