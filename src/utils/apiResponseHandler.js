import { API_RESPONSE_CODES } from '@/constants/apiResponseCodes'
import { API_MESSAGE_KEYS } from '@/i18n/locales/apiMessages'
import { showNotification } from '@/utils/notifications'
import { useAuthStore } from '@/stores/AuthStore'
import router from '@/router'
import i18n from '@/i18n'

const { t } = i18n.global

export const handleApiResponse = {
  success(response) {
    const code = response?.data?.code

    if (API_MESSAGE_KEYS[code]) {
      showNotification.success(t(API_MESSAGE_KEYS[code]))
      return { success: true }
    }

    return { success: true }
  },

  error(error) {
    const code = error.response?.data?.code

    // Обработка ошибок аутентификации
    if (Object.values(API_RESPONSE_CODES.AUTH_ERROR).includes(code)) {
      showNotification.error(t(API_MESSAGE_KEYS[code]))
      return { success: false, code }
    }

    // Обработка ошибок токена
    if (Object.values(API_RESPONSE_CODES.TOKEN_ERROR).includes(code)) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
      showNotification.error(t(API_MESSAGE_KEYS[code]))
      return { success: false, code }
    }

    // Обработка ошибок пользователя
    if (Object.values(API_RESPONSE_CODES.USER_ERROR).includes(code)) {
      showNotification.error(t(API_MESSAGE_KEYS[code]))
      return { success: false, code }
    }

    // Обработка системных ошибок
    if (Object.values(API_RESPONSE_CODES.SYSTEM_ERROR).includes(code)) {
      showNotification.error(t(API_MESSAGE_KEYS[code]))
      return { success: false, code }
    }

    // Обработка неизвестных ошибок
    showNotification.error(t('api.system.general_error'))
    return { success: false, code: API_RESPONSE_CODES.SYSTEM_ERROR.GENERAL }
  },
}
