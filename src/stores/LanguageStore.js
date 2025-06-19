import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import i18n from '@/i18n'
import axios from 'axios'
import api from '@/api'

export const useLanguageStore = defineStore('language', () => {
  const translations = ref({})
  const currentLanguage = ref(window.localStorage.getItem('language') || 'en')
  const isLoaded = ref(false)
  const locales = ref(['en', 'ru'])

  // Добавляем новые refs для прогресса
  const translationProgress = ref(0)
  const translationStatus = ref('idle') // idle, processing, completed, failed
  const translationMessage = ref('')

  let currentEventSource = null // Для хранения текущего соединения

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
    return new Promise((resolve, reject) => {
      try {
        console.log('Status before:', translationStatus.value)
        setTranslationStatus('processing')

        const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin
        const url = `${baseURL}/api/i18n/translate-language/${langCode}`
        console.log('EventSource URL:', url)

        if (currentEventSource) {
          currentEventSource.close()
        }

        currentEventSource = new EventSource(url)
        console.log('Creating EventSource for language:', langCode)

        currentEventSource.onopen = () => {
          console.log('EventSource opened successfully')
          setTranslationMessage('Starting translation...')
        }

        currentEventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.progress) {
              setTranslationProgress(data.progress)
            }
            if (data.message) {
              setTranslationMessage(data.message)
            }
          } catch (e) {
            console.error('Error parsing message:', e)
          }
        }

        currentEventSource.addEventListener('start', () => {
          setTranslationStatus('processing')
          setTranslationProgress(0)
        })

        currentEventSource.addEventListener('progress', (event) => {
          try {
            const data = JSON.parse(event.data)
            setTranslationProgress(data.progress || 0)
            setTranslationMessage(data.message || 'Translating...')
          } catch (e) {
            console.error('Error parsing progress:', e)
          }
        })

        currentEventSource.addEventListener('complete', () => {
          setTranslationStatus('completed')
          setTranslationMessage('Translation completed!')
          if (currentEventSource) {
            currentEventSource.close()
            currentEventSource = null
          }
          resolve(true)
        })

        currentEventSource.addEventListener('error', (event) => {
          console.error('Translation failed:', event)
          setTranslationStatus('failed')
          setTranslationMessage('Translation failed')
          if (currentEventSource) {
            currentEventSource.close()
            currentEventSource = null
          }
          reject(new Error('Translation failed'))
        })

        // Добавляем таймаут для соединения
        setTimeout(() => {
          if (translationStatus.value === 'processing') {
            setTranslationStatus('failed')
            setTranslationMessage('Connection timeout')
            if (currentEventSource) {
              currentEventSource.close()
              currentEventSource = null
            }
            reject(new Error('Connection timeout'))
          }
        }, 30000) // 30 секунд таймаут
      } catch (error) {
        console.error('Error in addLanguage:', error)
        setTranslationStatus('failed')
        setTranslationMessage('Error initializing translation')
        if (currentEventSource) {
          currentEventSource.close()
          currentEventSource = null
        }
        reject(error)
      }
    })
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
    // Добавляем новые поля в return
    translationProgress,
    translationStatus,
    translationMessage,
    setLanguage,
    initializeLanguage,
    addLanguage,
    changeLanguage,
    currentTranslations,
    fetchLocales,
    // Добавляем новые функции в return
    setTranslationProgress,
    setTranslationStatus,
    setTranslationMessage,
    resetTranslationState,
    cancelTranslation,
  }
})
