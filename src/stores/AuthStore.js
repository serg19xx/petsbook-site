/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '@/api' // Updated import
import i18n from '@/i18n'
import router from '@/router'
import { useUserStore } from './UserStore'

export const useAuthStore = defineStore(
  'auth',
  () => {
    //const userId = ref(null)
    //const userEmail = ref(null)
    //const userName = ref(null)
    //const userRole = ref(null)

    const loginInfo = ref(null)

    const loading = ref(false)
    const { t } = i18n.global

    const isReady = ref(false)
    const resetPasswordSuccess = ref(false)
    const resetPasswordError = ref(null)

    // Возвращаем ref, но правильно инициализируем
    const isAuthenticated = ref(false)

    // Функция инициализации
    const initializeAuth = () => {
      const hasToken = document.cookie.includes('auth_token=')
      const hasLoginInfo = !!loginInfo.value

      console.log('🔐 initializeAuth called:', {
        hasToken,
        hasLoginInfo,
        currentIsAuthenticated: isAuthenticated.value,
        cookies: document.cookie,
        timestamp: new Date().toISOString(),
      })

      // Если есть токен ИЛИ есть сохранённая информация о логине, считаем аутентифицированным
      isAuthenticated.value = hasToken || hasLoginInfo

      console.log('🔐 Auth state updated:', {
        isAuthenticated: isAuthenticated.value,
        timestamp: new Date().toISOString(),
      })
      return hasToken || hasLoginInfo
    }

    // Инициализируем сразу при создании store
    initializeAuth()

    const login = async (credentials) => {
      const codeMapping = {
        EMAIL_NOT_VERIFIED: 'MESSAGE.loginview.errors.email_not_verified',
        LOGIN_SUCCESS: 'MESSAGE.loginview.errors.login_success',
        MISSING_CREDENTIALS: 'MESSAGE.loginview.errors.missing_credentials',
      }
      loading.value = true
      try {
        const loginData = {
          email: credentials?.email.trim().toLowerCase() || '',
          password: credentials.password.trim() || '',
        }

        if (!loginData.email || !loginData.password) {
          return {
            status: 400,
            error_code: 'MISSING_CREDENTIALS',
            message: t(codeMapping['MISSING_CREDENTIALS']),
            data: null,
          }
        }

        let response
        try {
          response = await api.post('/api/auth/login', loginData, { withCredentials: true })
        } catch (apiError) {
          // Получаем error_code из ответа сервера
          const errorCode = apiError.response?.data?.error_code || 'LOGIN_FAILED'

          // Используем codeMapping для получения переведенного сообщения
          const messageKey = codeMapping[errorCode]

          const translatedMessage = messageKey
            ? t(messageKey)
            : apiError.response?.data?.message || apiError.message

          // Возвращаем ошибку в том же формате
          return {
            status: apiError.response?.data?.status || 500,
            error_code: errorCode,
            message: translatedMessage,
            data: null,
          }
        }
        // Обработка системных ошибок (500)
        if (response.data.status === 500 && response.data.error_code) {
          const systemErrors = ['SYSTEM_ERROR', 'DATABASE_ERROR', 'EMAIL_SEND_ERROR']

          if (systemErrors.includes(response.data.error_code)) {
            const errorMessage = response.data.data?.message || 'Системная ошибка'
            const errorDetails =
              response.data.data?.file && response.data.data?.line
                ? `\nФайл: ${response.data.data.file}:${response.data.data.line}`
                : ''

            return {
              status: 500,
              error_code: response.data.error_code,
              message: `Ошибка системы: ${errorMessage}${errorDetails}`,
              data: response.data.data,
              isSystemError: true,
            }
          }
        }

        if (response.data.status === 200) {
          console.log('🎉 Login successful, updating auth state')

          // Принудительно устанавливаем состояние аутентификации
          isAuthenticated.value = true

          // Сохраняем информацию о логине
          loginInfo.value = {
            email: credentials.email,
            loginTime: new Date().toISOString(),
            ...response.data.data,
          }

          const userStore = useUserStore()
          await userStore.fetchUserData()

          // Проверяем, установились ли куки после логина
          const hasTokenAfterLogin = document.cookie.includes('auth_token=')
          console.log('🍪 Cookies after login:', {
            hasToken: hasTokenAfterLogin,
            allCookies: document.cookie,
            isAuthenticated: isAuthenticated.value,
          })

          // Если куки не установились, но логин успешный - всё равно считаем пользователя аутентифицированным
          if (!hasTokenAfterLogin) {
            console.warn(
              '⚠️ No auth token cookie found after successful login, but keeping authenticated state',
            )
          }

          router.push('/')
          return {
            status: 200,
            error_code: response.data.error_code || 'LOGIN_SUCCESS',
            message: t(codeMapping['LOGIN_SUCCESS']),
            data: response.data.data || null,
          }
        }

        // Обработка EMAIL_NOT_VERIFIED
        if (response.data.error_code === 'EMAIL_NOT_VERIFIED') {
          return {
            status: 403, // Используем правильный статус 403
            error_code: 'EMAIL_NOT_VERIFIED',
            message: t(codeMapping['EMAIL_NOT_VERIFIED']),
            data: response.data.data || null,
            requiresEmailVerification: true,
          }
        }

        // Для других ошибок используем codeMapping или fallback
        const errorCode = response.data.error_code || 'LOGIN_FAILED'
        const translatedMessage = codeMapping[errorCode]
          ? t(codeMapping[errorCode])
          : response.data.message || 'Login failed'

        return {
          status: response.data.status || 500,
          error_code: errorCode,
          message: translatedMessage,
          data: null,
        }
      } catch (err) {
        // Получаем error_code из ответа сервера
        const errorCode = err.response?.data?.error_code || 'LOGIN_FAILED'

        // Используем codeMapping для получения переведенного сообщения
        const translatedMessage = codeMapping[errorCode]
          ? t(codeMapping[errorCode])
          : err.response?.data?.message || err.message

        return {
          status: err.response?.data?.status || 500,
          error_code: errorCode,
          message: translatedMessage,
          data: null,
        }
      } finally {
        loading.value = false
      }
    }

    const logout = async () => {
      console.log('🚪 LOGOUT CALLED:', {
        currentlyAuthenticated: isAuthenticated.value,
        hasToken: document.cookie.includes('auth_token='),
        stackTrace: new Error().stack,
        timestamp: new Date().toISOString(),
      })

      try {
        // Можно добавить запрос к API для логаута на сервере, если требуется
        const userStore = useUserStore()
        userStore.clearUserData()
        await api.post('/api/auth/logout', {}, { withCredentials: true })
        loginInfo.value = null
        localStorage.removeItem('auth')
        router.push('/login')
        isAuthenticated.value = false

        return {
          success: true,
          message: t('auth.logout_success'),
        }
      } catch (error) {
        console.error('Logout error:', error)
        return {
          success: false,
          message: t('auth.logout_error'),
        }
      }
    }

    const register = async (userData) => {
      const codeMapping = {
        EMAIL_ALREADY_EXISTS: 'MESSAGE.signupview.error.email_already_exists',
        REGISTRATION_SUCCESS: 'MESSAGE.signupview.success.registered',
        REGISTRATION_FAILED: 'MESSAGE.signupview.error.registration_failed',
        NETWORK_ERROR: 'MESSAGE.signupview.error.network_error',
        SERVER_ERROR: 'MESSAGE.signupview.error.server_error',
        VALIDATION_ERROR: 'MESSAGE.signupview.error.validation_error',
      }

      try {
        const response = await api.post(
          '/api/auth/register',
          {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
          },
          { withCredentials: true },
        )

        // Успешная регистрация
        if (response.data.status === 200) {
          return {
            success: true,
            message: t(codeMapping['REGISTRATION_SUCCESS']),
          }
        }

        // Обработка ошибок валидации (400)
        if (response.data.status === 400) {
          const errorCode = response.data.error_code || 'VALIDATION_ERROR'
          return {
            success: false,
            status: 400,
            error_code: errorCode,
            message: t(codeMapping[errorCode] || codeMapping['VALIDATION_ERROR']),
          }
        }

        // Другие ошибки сервера
        const errorCode = response.data.error_code || 'SERVER_ERROR'
        return {
          success: false,
          status: response.data.status || 500,
          error_code: errorCode,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      } catch (error) {
        console.error('Registration error:', error)

        // Сетевые ошибки
        if (!error.response) {
          return {
            success: false,
            error_code: 'NETWORK_ERROR',
            message: t(codeMapping['NETWORK_ERROR']),
          }
        }

        // Ошибки от сервера
        const errorCode = error.response.data?.error_code || 'SERVER_ERROR'
        return {
          success: false,
          status: error.response.status,
          error_code: errorCode,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      }
    }

    const requestPasswordReset = async (email) => {
      const codeMapping = {
        PASSWORD_RESET_EMAIL_SENT: 'MESSAGE.passwordrecoveryview.success.email_sent',
        EMAIL_NOT_FOUND: 'MESSAGE.passwordrecoveryview.error.email_not_found',
        NETWORK_ERROR: 'MESSAGE.passwordrecoveryview.error.network_error',
        SERVER_ERROR: 'MESSAGE.passwordrecoveryview.error.server_error',
      }

      try {
        const response = await api.post(
          '/api/auth/password-reset',
          { email },
          { withCredentials: true },
        )

        // Успешная отправка
        if (response.data.status === 200) {
          return {
            success: true,
            status: 200,
            error_code: response.data.error_code || 'PASSWORD_RESET_EMAIL_SENT',
            message: t(codeMapping['PASSWORD_RESET_EMAIL_SENT'], { email }),
          }
        }

        // Ошибки валидации
        if (response.data.status === 400) {
          const errorCode = response.data.error_code || 'EMAIL_NOT_FOUND'
          return {
            success: false,
            status: 400,
            error_code: errorCode,
            message: t(codeMapping[errorCode] || codeMapping['EMAIL_NOT_FOUND']),
          }
        }

        // Другие ошибки
        const errorCode = response.data.error_code || 'SERVER_ERROR'
        return {
          success: false,
          status: response.data.status || 500,
          error_code: errorCode,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      } catch (error) {
        console.error('Password reset request error:', error)

        // Сетевые ошибки
        if (!error.response) {
          return {
            success: false,
            error_code: 'NETWORK_ERROR',
            message: t(codeMapping['NETWORK_ERROR']),
          }
        }

        // Ошибки от сервера
        const errorCode = error.response.data?.error_code || 'SERVER_ERROR'
        return {
          success: false,
          status: error.response.status,
          error_code: errorCode,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      }
    }

    const resetPassword = async (token, password) => {
      const codeMapping = {
        PASSWORD_RESET_SUCCESS: 'MESSAGE.resetpasswordview.success.password_changed',
        INVALID_TOKEN: 'MESSAGE.resetpasswordview.error.invalid_token',
        TOKEN_EXPIRED: 'MESSAGE.resetpasswordview.error.token_expired',
        WEAK_PASSWORD: 'MESSAGE.resetpasswordview.error.weak_password',
        NETWORK_ERROR: 'MESSAGE.resetpasswordview.error.network_error',
        SERVER_ERROR: 'MESSAGE.resetpasswordview.error.server_error',
      }

      try {
        // Проверяем, что token и password переданы корректно
        if (!token || !password) {
          resetPasswordError.value = t(codeMapping['INVALID_TOKEN'])
          resetPasswordSuccess.value = false
          return false
        }

        const response = await api.post('/api/auth/set-new-password', { token, password })

        // Успешный сброс пароля
        if (response.data.status === 200) {
          resetPasswordSuccess.value = true
          resetPasswordError.value = null
          return true
        }

        // Ошибки валидации
        if (response.data.status === 400) {
          const errorCode = response.data.error_code || 'INVALID_TOKEN'
          resetPasswordError.value = t(codeMapping[errorCode] || codeMapping['INVALID_TOKEN'])
          resetPasswordSuccess.value = false
          return false
        }

        // Другие ошибки
        const errorCode = response.data.error_code || 'SERVER_ERROR'
        resetPasswordError.value = t(codeMapping[errorCode] || codeMapping['SERVER_ERROR'])
        resetPasswordSuccess.value = false
        return false
      } catch (error) {
        console.error('Reset password error:', error)

        // Сетевые ошибки
        if (!error.response) {
          resetPasswordError.value = t(codeMapping['NETWORK_ERROR'])
          resetPasswordSuccess.value = false
          return false
        }

        // Ошибки от сервера
        const errorCode = error.response.data?.error_code || 'SERVER_ERROR'
        resetPasswordError.value = t(codeMapping[errorCode] || codeMapping['SERVER_ERROR'])
        resetPasswordSuccess.value = false
        return false
      }
    }

    const validateResetToken = async (token) => {
      const codeMapping = {
        TOKEN_VALID: 'MESSAGE.resetpasswordview.success.token_valid',
        INVALID_TOKEN: 'MESSAGE.resetpasswordview.error.invalid_token',
        TOKEN_EXPIRED: 'MESSAGE.resetpasswordview.error.token_expired',
        NETWORK_ERROR: 'MESSAGE.resetpasswordview.error.network_error',
        SERVER_ERROR: 'MESSAGE.resetpasswordview.error.server_error',
      }

      try {
        const response = await api.post('/api/auth/validate-reset-token', { token })

        // Успешная валидация токена
        if (response.data.status === 200) {
          return {
            status: 200,
            error_code: response.data.error_code || 'TOKEN_VALID',
            message: t(codeMapping['TOKEN_VALID']),
            data: response.data.data || null,
          }
        }

        // Ошибки валидации токена
        if (response.data.status === 400) {
          const errorCode = response.data.error_code || 'INVALID_TOKEN'
          return {
            status: 400,
            error_code: errorCode,
            message: t(codeMapping[errorCode] || codeMapping['INVALID_TOKEN']),
            data: null,
          }
        }

        // Другие ошибки
        const errorCode = response.data.error_code || 'SERVER_ERROR'
        return {
          status: response.data.status || 500,
          error_code: errorCode,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
          data: null,
        }
      } catch (error) {
        console.error('Token validation error:', error)

        // Сетевые ошибки
        if (!error.response) {
          return {
            status: 500,
            error_code: 'NETWORK_ERROR',
            message: t(codeMapping['NETWORK_ERROR']),
            data: null,
          }
        }

        // Ошибки от сервера
        const errorCode = error.response.data?.error_code || 'SERVER_ERROR'
        return {
          status: error.response.status || 500,
          error_code: errorCode,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
          data: null,
        }
      }
    }
    // Добавим методы для работы с неверифицированными email
    const resendVerificationEmail = async (email) => {
      const codeMapping = {
        VERIFICATION_SENT: 'MESSAGE.emailverification.success.verification_sent',
        EMAIL_NOT_FOUND: 'MESSAGE.emailverification.error.email_not_found',
        NETWORK_ERROR: 'MESSAGE.emailverification.error.network_error',
        SERVER_ERROR: 'MESSAGE.emailverification.error.server_error',
      }

      try {
        const response = await api.post(
          '/auth/resend-unverified-email',
          { email },
          { withCredentials: true },
        )

        if (response.data.status === 200) {
          return {
            success: true,
            message: t(codeMapping['VERIFICATION_SENT']),
          }
        }

        const errorCode = response.data.error_code || 'SERVER_ERROR'
        return {
          success: false,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      } catch (error) {
        console.error('Resend verification error:', error)

        if (!error.response) {
          return {
            success: false,
            message: t(codeMapping['NETWORK_ERROR']),
          }
        }

        const errorCode = error.response.data?.error_code || 'SERVER_ERROR'
        return {
          success: false,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      }
    }

    const deleteUnverifiedAccount = async (email) => {
      const codeMapping = {
        ACCOUNT_DELETED: 'MESSAGE.emailverification.success.account_deleted',
        EMAIL_NOT_FOUND: 'MESSAGE.emailverification.error.email_not_found',
        NETWORK_ERROR: 'MESSAGE.emailverification.error.network_error',
        SERVER_ERROR: 'MESSAGE.emailverification.error.server_error',
      }

      try {
        const response = await api.delete('/auth/delete-unverified-email', {
          data: { email },
          withCredentials: true,
        })

        if (response.data.status === 200) {
          return {
            success: true,
            message: t(codeMapping['ACCOUNT_DELETED']),
          }
        }

        const errorCode = response.data.error_code || 'SERVER_ERROR'
        return {
          success: false,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      } catch (error) {
        console.error('Delete unverified account error:', error)

        if (!error.response) {
          return {
            success: false,
            message: t(codeMapping['NETWORK_ERROR']),
          }
        }

        const errorCode = error.response.data?.error_code || 'SERVER_ERROR'
        return {
          success: false,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      }
    }

    const updateEmailForUnverified = async (oldEmail, newEmail) => {
      const codeMapping = {
        EMAIL_UPDATED: 'MESSAGE.emailverification.success.email_updated',
        EMAIL_NOT_FOUND: 'MESSAGE.emailverification.error.email_not_found',
        EMAIL_ALREADY_EXISTS: 'MESSAGE.emailverification.error.email_already_exists',
        NETWORK_ERROR: 'MESSAGE.emailverification.error.network_error',
        SERVER_ERROR: 'MESSAGE.emailverification.error.server_error',
      }

      try {
        const response = await api.patch(
          '/auth/update-unverified-email',
          {
            oldEmail,
            newEmail,
          },
          { withCredentials: true },
        )

        if (response.data.status === 200) {
          return {
            success: true,
            message: t(codeMapping['EMAIL_UPDATED']),
            data: response.data.data,
          }
        }

        const errorCode = response.data.error_code || 'SERVER_ERROR'
        return {
          success: false,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      } catch (error) {
        console.error('Update email error:', error)

        if (!error.response) {
          return {
            success: false,
            message: t(codeMapping['NETWORK_ERROR']),
          }
        }

        const errorCode = error.response.data?.error_code || 'SERVER_ERROR'
        return {
          success: false,
          message: t(codeMapping[errorCode] || codeMapping['SERVER_ERROR']),
        }
      }
    }

    // Отслеживаем изменения isAuthenticated
    watch(
      isAuthenticated,
      (newValue, oldValue) => {
        console.log('🔐 Auth state changed:', {
          from: oldValue,
          to: newValue,
          hasToken: document.cookie.includes('auth_token='),
          timestamp: new Date().toISOString(),
          stackTrace: new Error().stack,
        })
      },
      { immediate: false },
    )

    return {
      loading,
      isAuthenticated,
      isReady,
      initializeAuth,
      login,
      logout,
      register,
      requestPasswordReset,
      resetPassword,
      validateResetToken,
      loginInfo,
      resetPasswordSuccess,
      resetPasswordError,
      resendVerificationEmail,
      deleteUnverifiedAccount,
      updateEmailForUnverified,
    }
  },
  {
    persist: {
      // Исключаем isAuthenticated из persist - он будет инициализироваться из куков
      paths: ['loginInfo', 'resetPasswordSuccess', 'resetPasswordError'],
    },
  },
)
