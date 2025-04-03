import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

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
      console.log('Sending login request to:', '/auth/login')
      const response = await api.post('/auth/login', credentials)
      console.log('Raw server response:', response.data)

      // Проверяем наличие данных в ответе
      if (response.data && response.data.token) {
        token.value = response.data.token
        localStorage.setItem('token', response.data.token)
        user.value = response.data.user
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

        return {
          success: true,
          message: 'Вход выполнен успешно',
        }
      }

      // Если нет токена в ответе, считаем это ошибкой
      error.value = response.data?.message || 'Неверные учетные данные'
      return {
        success: false,
        message: error.value,
      }
    } catch (err) {
      console.error('Login request error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })

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
      // Сначала очищаем локальное состояние
      const currentToken = token.value

      // Очищаем состояние
      token.value = null
      user.value = null
      localStorage.removeItem('token')

      // Очищаем заголовок авторизации
      delete api.defaults.headers.common['Authorization']

      // Уведомляем сервер только если был токен
      if (currentToken) {
        try {
          await api.post(
            '/auth/logout',
            {},
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            },
          )
        } catch (error) {
          console.warn('Server logout failed:', error)
          // Игнорируем ошибку, так как локальное состояние уже очищено
        }
      }

      return {
        success: true,
        message: 'Выход выполнен успешно',
      }
    } catch (err) {
      console.warn('Logout error:', err)
      // Даже при ошибке считаем выход успешным, так как локальное состояние уже очищено
      return {
        success: true,
        message: 'Выход выполнен успешно',
      }
    }
  }

  // Проверка аутентификации
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Инициализация состояния при загрузке
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      // Здесь можно добавить запрос для получения данных пользователя
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
