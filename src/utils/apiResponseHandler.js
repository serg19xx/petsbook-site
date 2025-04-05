import { API_CODES } from '@/constants/apiCodes'
import { showNotification } from '@/utils/notifications'
import { useAuthStore } from '@/stores/AuthStore'
import router from '@/router'

export const handleApiResponse = {
  auth: {
    handle(response) {
      const code = response?.data?.code || response?.code

      switch (code) {
        case API_CODES.AUTH.SUCCESS:
          return { success: true }

        case API_CODES.AUTH.INVALID_CREDENTIALS:
          showNotification.error('auth.invalid_credentials')
          return { success: false }

        case API_CODES.AUTH.TOKEN_EXPIRED:
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          showNotification.error('auth.session_expired')
          return { success: false }

        case API_CODES.AUTH.EMAIL_NOT_VERIFIED:
          showNotification.warning('auth.email_not_verified')
          return { success: false }

        default:
          showNotification.error('errors.unexpected_error')
          return { success: false }
      }
    },
  },

  validation: {
    handle(response) {
      const code = response?.data?.code || response?.code

      switch (code) {
        case API_CODES.VALIDATION.INVALID_DATA:
          showNotification.error('validation.invalid_data')
          return { success: false }

        case API_CODES.VALIDATION.REQUIRED_FIELD:
          showNotification.error('validation.required_field')
          return { success: false }

        case API_CODES.VALIDATION.PASSWORD_TOO_WEAK:
          showNotification.error('validation.password.weak')
          return { success: false }

        default:
          showNotification.error('validation.general_error')
          return { success: false }
      }
    },
  },

  error: {
    handle(error) {
      if (!error.response) {
        showNotification.error('errors.network_error')
        return { success: false }
      }

      const code = error.response?.data?.code

      switch (code) {
        case API_CODES.OPERATION.FORBIDDEN:
          showNotification.error('errors.forbidden')
          return { success: false }

        case API_CODES.OPERATION.UNAUTHORIZED:
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          showNotification.error('errors.unauthorized')
          return { success: false }

        case API_CODES.DATA.NOT_FOUND:
          showNotification.error('errors.not_found')
          return { success: false }

        default:
          showNotification.error('errors.unexpected_error')
          return { success: false }
      }
    },
  },
}
