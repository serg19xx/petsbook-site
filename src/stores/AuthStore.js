import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, { apiService } from '@/api' // Updated import
import { useUserStore } from './UserStore'
import i18n from '@/i18n'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const loading = ref(false)
  const { t } = i18n.global

  // Добавляем computed свойство для проверки аутентификации
  const isAuthenticated = computed(() => !!token.value)

  // Добавляем функцию инициализации
  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token')

    if (storedToken) {
      token.value = storedToken
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`

      // Получаем данные пользователя при инициализации
      const userStore = useUserStore()
      const userDataResult = await userStore.fetchUserData()

      if (userDataResult.success) {
        user.value = userDataResult.data
      } else {
        // Если не удалось получить данные пользователя, выполняем выход
        logout()
      }
    }
  }

  const login = async (credentials) => {
    loading.value = true

    try {
      const loginData = {
        email: credentials?.email?.trim().toLowerCase() || '',
        password: credentials?.password?.trim() || '',
      }

      if (!loginData.email || !loginData.password) {
        return {
          success: false,
          message: t('auth.api.missing_credentials'),
        }
      }

      const response = await api.post('/auth/login', loginData)

      // Если успешный вход
      if (response?.data?.success && response?.data?.data?.token) {
        const receivedToken = response.data.data.token

        token.value = receivedToken
        localStorage.setItem('token', receivedToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`

        // Получаем данные пользователя через единую функцию
        const userStore = useUserStore()
        const userDataResult = await userStore.fetchUserData()

        if (!userDataResult.success) {
          throw new Error('Failed to fetch user data')
        }

        return {
          success: true,
          message: response.data.message,
        }
      }

      return {
        success: false,
        message: response.data.message || t('auth.api.login_error'),
      }

    } catch (err) {
      console.error('Login error:', err.response?.data || err)
      return {
        success: false,
        message: err.response?.data?.message || t('auth.api.system_error'),
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Можно добавить запрос к API для логаута на сервере, если требуется
      // await api.post('/auth/logout')

      // Очищаем локальные данные
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']

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
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      })

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
      const response = await api.post('/auth/password-reset', { email })

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

  const resetPassword = async ({ token, password }) => {
    try {
      const { data } = await api.post('/auth/set-new-password', { token, password })
      return data // Возвращаем именно data от сервера
    } catch (error) {
      if (error.response) {
        return error.response.data // Возвращаем data из ошибки
      }
      throw error // Если что-то совсем плохое
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
  }
})
