import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'uk',
  fallbackLocale: 'en',
  messages: {},
})

// Добавляем глобальный обработчик ошибок
i18n.global.missing = (locale, key) => {
  console.error(`Missing translation: ${key} for locale: ${locale}`)
  return key
}

// Добавьте логирование
console.log('i18n messages:', i18n.global.messages)

export default i18n
