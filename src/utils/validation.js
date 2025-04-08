import { helpers } from '@vuelidate/validators'
import i18n from '@/i18n'

const { t } = i18n.global

export const withI18nMessage = (validator, messageKey, messageData = {}) => {
  return helpers.withMessage((props) => {
    return t(`validation.${messageKey}`, { ...messageData, ...props })
  }, validator)
}

export const normalizeUrl = (url) => {
  if (!url) return ''

  let normalizedUrl = url.trim()
  normalizedUrl = normalizedUrl.replace(/^(https?:\/\/)+(www\.)?/, '')
  normalizedUrl = normalizedUrl.replace(/^www\./, '')

  if (!normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl
  }

  return normalizedUrl
}

export const customValidators = {
  required: (value) => !!value && (!Array.isArray(value) || value.length > 0),
  email: (value) => {
    // Более строгая валидация email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return !value || emailRegex.test(value)
  },
  minLength: (min) => (value) => !value || value.length >= min,
  maxLength: (max) => (value) => !value || value.length <= max,
  phone: (value) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return !value || phoneRegex.test(value)
  },
  url: (value) => {
    if (!value) return true
    // Более простая валидация URL - проверяем только наличие домена и расширения
    const urlRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/
    return urlRegex.test(value.replace(/^(https?:\/\/)?(www\.)?/, ''))
  },
  passwordMatch: (password) => (value) => !value || value === password,
  alphaNum: (value) => !value || /^[a-zA-Z0-9]*$/.test(value),
  integer: (value) => !value || Number.isInteger(Number(value)),
  decimal: (value) => !value || !isNaN(parseFloat(value)),
  date: (value) => !value || !isNaN(Date.parse(value)),
}

export const createValidationRules = (rules) => {
  const validationRules = {}

  Object.entries(rules).forEach(([field, fieldRules]) => {
    validationRules[field] = {}

    Object.entries(fieldRules).forEach(([ruleName, ruleConfig]) => {
      if (typeof ruleConfig === 'object') {
        const { value, message } = ruleConfig
        validationRules[field][ruleName] = withI18nMessage(
          customValidators[ruleName](value),
          message || ruleName,
          { [ruleName]: value },
        )
      } else {
        validationRules[field][ruleName] = withI18nMessage(customValidators[ruleName], ruleName)
      }
    })
  })

  return validationRules
}

export const handleApiError = (error) => {
  if (!error.response) {
    return t('errors.network')
  }

  const { status } = error.response

  switch (status) {
    case 401:
      return t('errors.unauthorized')
    case 403:
      return t('errors.forbidden')
    case 404:
      return t('errors.notFound')
    case 422:
      return t('errors.validation')
    case 500:
      return t('errors.server')
    default:
      return t('errors.unknown')
  }
}
