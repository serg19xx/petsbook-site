import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
  const translations = ref({})
  const currentLanguage = ref(localStorage.getItem('language') || 'en')
  const isLoaded = ref(false)
  const locales = ref(['en', 'ru'])

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
      console.log('Fetching translations for language:', lang)
      const response = await fetch(`/api/i18n/translations/${lang}`)

      // Добавляем логирование ответа
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Получаем текст ответа для отладки
      const responseText = await response.text()
      console.log('Raw response:', responseText)

      // Пытаемся распарсить JSON только если это действительно JSON
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        console.error('Response was:', responseText)
        return null
      }

      if (responseData.status !== 200) {
        console.error('API returned error:', responseData.message)
        return null
      }

      const { data } = responseData

      console.log('=== DEBUG TRANSLATIONS LOADING ===')
      console.log('1. Raw API Response:', data)
      console.log('2. Current i18n locale:', i18n.global.locale.value)
      console.log('3. Current i18n messages:', i18n.global.messages.value)

      // Создаем объект для всех переводов
      const newTranslations = {}

      // Проверяем наличие translations и обрабатываем только существующие секции
      if (data.translations) {
        // Обрабатываем каждую секцию (UI, MESSAGE, VALIDATION)
        Object.entries(data.translations).forEach(([namespace, items]) => {
          newTranslations[namespace] = {}

          // Обрабатываем каждый перевод в секции
          items.forEach((item) => {
            // Убираем префикс namespace из ключа, так как он уже есть в базе
            const keyWithoutNamespace = item.key.replace(`${namespace}.`, '')
            const parts = keyWithoutNamespace.split('.')
            let current = newTranslations[namespace]

            // Создаем вложенную структуру
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i]
              if (!current[part] || typeof current[part] !== 'object' || current[part] === null) {
                current[part] = {}
              }
              current = current[part]
            }

            // Устанавливаем значение
            const lastPart = parts[parts.length - 1]
            current[lastPart] = item.value
          })
        })
      }

      console.log('4. Processed translations:', newTranslations)

      // Устанавливаем локаль и сообщения
      i18n.global.locale.value = lang
      i18n.global.setLocaleMessage(lang, newTranslations)

      console.log('=== DEBUG I18N SETUP ===')
      console.log('1. Current locale:', i18n.global.locale.value)
      console.log('2. Available locales:', i18n.global.availableLocales)
      console.log('3. Messages structure:', JSON.stringify(i18n.global.messages.value, null, 2))
      console.log('4. Test translation:', i18n.global.t('editprofile.fields.nickname'))
      console.log('========================')

      translations.value = newTranslations
      currentLanguage.value = lang
      isLoaded.value = true
      localStorage.setItem('language', lang)

      return newTranslations
    } catch (error) {
      console.error('Failed to load language:', error)
      return null
    }
  }

  async function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'en'
    return await setLanguage(savedLanguage)
  }

  return {
    translations,
    currentLanguage,
    isLoaded,
    locales,
    setLanguage,
    initializeLanguage,
  }
})

