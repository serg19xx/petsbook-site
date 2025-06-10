import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {},
  sync: true,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
})

// Добавляем глобальный обработчик ошибок
i18n.global.missing = (locale, key) => {
  console.error(`Missing translation: ${key} for locale: ${locale}`)
  return key
}

export default i18n
