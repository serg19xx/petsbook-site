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
    return new Promise((resolve, reject) => {
      let retryCount = 0
      const maxRetries = 3
      const retryDelay = 1000 // 1 second

      function createEventSource() {
        try {
          console.log('Status before:', translationStatus.value)
          setTranslationStatus('processing')

          // Ensure we have a proper base URL that includes protocol
          let baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin
          if (!baseURL.startsWith('http')) {
            baseURL = window.location.protocol + '//' + baseURL
          }
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
            retryCount = 0 // Reset retry count on successful connection
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
            console.error('Translation error occurred:', event)

            if (retryCount < maxRetries) {
              console.log(`Retrying connection (${retryCount + 1}/${maxRetries})...`)
              if (currentEventSource) {
                currentEventSource.close()
                currentEventSource = null
              }
              retryCount++
              setTimeout(createEventSource, retryDelay)
            } else {
              console.error('Max retries reached, translation failed')
              setTranslationStatus('failed')
              setTranslationMessage('Translation failed after multiple attempts')
              if (currentEventSource) {
                currentEventSource.close()
                currentEventSource = null
              }
              reject(new Error('Translation failed after multiple attempts'))
            }
          })

          // Add connection timeout
          setTimeout(() => {
            if (translationStatus.value === 'processing' && retryCount >= maxRetries) {
              setTranslationStatus('failed')
              setTranslationMessage('Connection timeout')
              if (currentEventSource) {
                currentEventSource.close()
                currentEventSource = null
              }
              reject(new Error('Connection timeout'))
            }
          }, 30000) // 30 seconds timeout
        } catch (error) {
          console.error('Error in addLanguage:', error)
          if (retryCount < maxRetries) {
            console.log(`Retrying after error (${retryCount + 1}/${maxRetries})...`)
            retryCount++
            setTimeout(createEventSource, retryDelay)
          } else {
            setTranslationStatus('failed')
            setTranslationMessage('Error initializing translation')
            if (currentEventSource) {
              currentEventSource.close()
              currentEventSource = null
            }
            reject(error)
          }
        }
      }

      // Start the initial connection attempt
      createEventSource()
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
