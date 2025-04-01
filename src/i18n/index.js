import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import ru from './locales/ru.json'
import uk from './locales/uk.json'
import cs from './locales/cs.json'

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ru: 'Русский',
  uk: 'Українська',
  cs: 'Čeština',
  new: 'Add New Language',
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
    es,
    ru,
    uk,
    cs,
  },
})

export default i18n

export const COUNTRY_LANGUAGE_MAP = {
  US: 'en',
  GB: 'en',
  AU: 'en',
  FR: 'fr',
  ES: 'es',
  RU: 'ru',
  UA: 'uk',
  CZ: 'cs',
}
