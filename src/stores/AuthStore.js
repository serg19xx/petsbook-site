import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'
import { useUserStore } from './UserStore'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isUser = computed(() => user.value?.role === 'user')
  const isBusiness = computed(() => user.value?.role === 'business')

  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', credentials)

      if (response.data && response.data.token) {
        token.value = response.data.token
        localStorage.setItem('token', response.data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

        // Получаем данные пользователя после успешного логина
        const userStore = useUserStore()
        const userDataResult = await userStore.fetchUserData()

        if (userDataResult.success) {
          user.value = userDataResult.data
        }

        return {
          success: true,
          message: 'Вход выполнен успешно',
        }
      }

      error.value = response.data?.message || 'Неверные учетные данные'
      return {
        success: false,
        message: error.value,
      }
    } catch (err) {
      console.error('Login request error:', err)
      error.value = err.response?.data?.message || 'Ошибка при входе в систему'
      return {
        success: false,
        message: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      const currentToken = token.value

      // Очищаем состояние
      token.value = null
      user.value = null
      localStorage.removeItem('token')

      // Очищаем данные пользователя
      const userStore = useUserStore()
      userStore.clearUserData()

      // Очищаем заголовок авторизации
      delete api.defaults.headers.common['Authorization']

      if (currentToken) {
        try {
          await api.post(
            '/auth/logout',
            {},
            {
              headers: { Authorization: `Bearer ${currentToken}` },
            },
          )
        } catch (error) {
          console.warn('Server logout failed:', error)
        }
      }

      return {
        success: true,
        message: 'Выход выполнен успешно',
      }
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка при выходе',
      }
    }
  }

  // Проверка аутентификации
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Инициализация состояния при загрузке
  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`

      const userStore = useUserStore()
      try {
        const result = await userStore.fetchUserData()
        if (result.success) {
          user.value = result.data
        } else {
          await logout()
        }
      } catch (err) {
        console.error('Failed to fetch user data during initialization:', err)
        await logout()
      }
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAdmin,
    isUser,
    isBusiness,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
  }
})
