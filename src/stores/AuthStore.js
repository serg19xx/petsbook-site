/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api' // Updated import
import i18n from '@/i18n'

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

    const isAuthenticated = ref(false)

    //const userAvatar = ref(null)

    const resetPasswordSuccess = ref(false)
    const resetPasswordError = ref(null)

    const login = async (credentials) => {
      loading.value = true
      try {
        const loginData = {
          email: credentials?.email.trim().toLowerCase() || '',
          password: credentials.password.trim() || '',
        }

        if (!loginData.email || !loginData.password) {
          return { success: false, message: t('auth.api.missing_credentials') }
        }

        const response = await api.post('/auth/login', loginData, { withCredentials: true })

        if (response.data.success) {
          loginInfo.value = response.data.user
          isAuthenticated.value = true
          return { success: true, message: response.data.message }
        }
        return { success: false, message: response.data.message || t('auth.api.login_error') }
      } catch (err) {
        // ...
        console.log('Login error:', err)
      } finally {
        loading.value = false
      }
    }

    const logout = async () => {
      try {
        // Можно добавить запрос к API для логаута на сервере, если требуется
        await api.post('/auth/logout', {}, { withCredentials: true })
        loginInfo.value = null
        isAuthenticated.value = false
        localStorage.removeItem('auth')
        //router.push('/')

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
      try {
        const response = await api.post(
          '/auth/register',
          {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
          },
          { withCredentials: true },
        )

        // Возвращаем статус для обработки в компоненте
        if (response.status === 400) {
          return {
            success: false,
            status: 400,
            error_code: response.data.error_code || 'REGISTRATION_FAILED',
            message: response.data.message || t('notifications.registration.failed'),
          }
        }

        if (response.status === 200) {
          return {
            success: true,
            message: t('auth.api.registration_success'),
          }
        }

        return {
          success: false,
          error_code: 'SERVER_ERROR',
          message: t('notifications.registration.system_error'),
        }
      } catch (error) {
        console.log('Registration error details:', {
          response: error.response,
          data: error.response?.data,
          status: error.response?.status,
        })

        if (!error.response) {
          return {
            success: false,
            error_code: 'NETWORK_ERROR',
            message: t('notifications.registration.network_error'),
          }
        }

        return {
          success: false,
          status: error.response.status,
          error_code: error.response.data.error_code || 'SERVER_ERROR',
          message: error.response.data.message || t('notifications.registration.system_error'),
        }
      }
    }

    const requestPasswordReset = async (email) => {
      try {
        const response = await api.post(
          '/auth/password-reset',
          { email },
          { withCredentials: true },
        )

        return {
          success: true,
          message: t('auth.api.reset_link_sent'),
        }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || t('auth.api.reset_request_error'),
        }
      }
    }

    const resetPassword = async (token, password) => {
      try {
        console.log('Sending reset password request with token:', token)
        const response = await api.post('/auth/set-new-password', { token, password })

        // Проверяем успешный ответ
        if (response.data.success) {
          resetPasswordSuccess.value = true
          resetPasswordError.value = null
          return true
        } else {
          resetPasswordError.value = response.data.message || 'Failed to reset password'
          resetPasswordSuccess.value = false
          return false
        }
      } catch (error) {
        console.error('Reset password error:', error)
        resetPasswordError.value = error.response?.data?.message || 'Failed to reset password'
        resetPasswordSuccess.value = false
        return false
      }
    }

    const validateResetToken = async (token) => {
      try {
        const response = await api.post('/auth/validate-reset-token', { token })
        console.log('Token validation response:===', response.data) // для отладки

        // Исправленная проверка
        if (response.data.status) {
          return {
            success: true,
            error_code: 'TOKEN_VALID',
          }
        }

        return {
          success: false,
          error_code: response.data.error_code || 'INVALID_TOKEN',
          message: response.data.message || t('auth.api.invalid_token'),
        }
      } catch (error) {
        console.error('Token validation error:', error)
        return {
          success: false,
          error_code: error.response?.data?.error_code || 'INVALID_TOKEN',
          message: error.response?.data?.message || t('auth.api.invalid_token'),
        }
      }
    }

    return {
      loading,
      isAuthenticated,
      //initializeAuth,
      login,
      logout,
      register,
      requestPasswordReset,
      resetPassword,
      //userAvatar,
      validateResetToken,
      loginInfo,
      resetPasswordSuccess,
      resetPasswordError,
    }
  },
  { persist: true },
)
