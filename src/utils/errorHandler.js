import { API_CODES } from '@/constants/apiCodes'
import { showNotification } from '@/utils/notifications'
import i18n from '@/i18n'

const { t } = i18n.global

export const handleGeneralError = (error) => {
  const errorCode = error?.response?.data?.code || API_CODES.GENERAL.UNKNOWN_ERROR
  const status = error?.response?.data?.status || 500
  const message = error?.response?.data?.message || ''
  const errorMessages = {
    [API_CODES.GENERAL.VALIDATION_ERROR]: 'errors.general.validation',
    [API_CODES.GENERAL.PERMISSION_ERROR]: 'errors.general.permission',
    [API_CODES.GENERAL.RESOURCE_ERROR]: 'errors.general.resource',
    [API_CODES.GENERAL.BUSINESS_ERROR]: 'errors.general.business',
    [API_CODES.GENERAL.TECHNICAL_ERROR]: 'errors.general.technical',
  }
  const messageKey = errorMessages[errorCode] || 'errors.general.unknown'
  showNotification.error(messageKey)
  return {
    status,
    error_code: errorCode,
    message,
    data: null,
  }
}

export const isGeneralError = (errorCode) => {
  return Object.values(API_CODES.GENERAL).includes(errorCode)
}
