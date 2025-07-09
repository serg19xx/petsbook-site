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
    return {
      status: response?.data?.status || 200,
      error_code: code || '',
      message: '',
      data: response?.data?.data || null,
    }
  },

  error(error) {
    const code = error.response?.data?.code
    return {
      status: error.response?.data?.status || 500,
      error_code: code || '',
      message: error.response?.data?.message || '',
      data: null,
    }
  },
}
