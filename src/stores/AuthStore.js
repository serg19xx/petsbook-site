import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'
import { useUserStore } from './UserStore'
import { toast } from 'vue3-toastify'

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
      const loginData = {
        email: credentials?.email?.trim().toLowerCase() || '',
        password: credentials?.password?.trim() || '',
      }

      const response = await api
        .post('/auth/login', loginData)
        .then((response) => {
          console.log('Login success response:', response?.data)
          return response
        })
        .catch((error) => {
          console.log('Login error response:', error.response?.data)
          return error.response
        })

      // Проверяем успешный ответ по статусу и коду
      if (response?.data?.status === 200 && response?.data?.error_code === 'LOGIN_SUCCESS') {
        // Получаем токен из data
        const receivedToken = response.data?.data?.token

        if (receivedToken) {
          // Устанавливаем токен в ref
          token.value = receivedToken
          // Сохраняем в localStorage
          localStorage.setItem('token', receivedToken)
          // Устанавливаем заголовок авторизации
          api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`

          const userStore = useUserStore()
          const userDataResult = await userStore.fetchUserData()

          if (userDataResult.success) {
            user.value = userDataResult.data
            return {
              success: true,
              error_code: 'LOGIN_SUCCESS',
              message: 'Вход выполнен успешно',
            }
          }
        }
      }

      // Возвращаем объект с кодом ошибки
      return {
        success: false,
        error_code: response?.data?.error_code || 'UNKNOWN_ERROR',
        message: response?.data?.message || 'Неизвестная ошибка при входе',
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
      return {
        success: false,
        error_code: 'SYSTEM_ERROR',
        message: 'Непредвиденная ошибка при входе',
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

  const register = async (userData) => {
    loading.value = true
    error.value = null

    try {
      const requestData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        password: userData.password,
      }

      const response = await api.post('/auth/register', requestData)

      if (response.data && response.data.success) {
        toast.success(
          'Поздравляем с успешной регистрацией! Для завершения процесса, пожалуйста, проверьте вашу электронную почту и перейдите по ссылке для подтверждения email адреса. После подтверждения вы сможете войти в систему.',
          {
            autoClose: 8000, // Увеличиваем время показа важного сообщения
          },
        )
        return {
          success: true,
          message: 'Регистрация успешно завершена',
        }
      }

      // Получаем конкретную ошибку с бекенда
      error.value = response.data?.message || 'Ошибка при регистрации'
      toast.error(error.value, {
        autoClose: 5000,
      })
      return {
        success: false,
        message: error.value,
      }
    } catch (err) {
      // Извлекаем конкретную ошибку из ответа бекенда
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.'
      console.error('Registration error:', err)
      toast.error(errorMessage, {
        autoClose: 5000,
      })

      return {
        success: false,
        message: errorMessage,
      }
    } finally {
      loading.value = false
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
    register,
    initializeAuth,
  }
})
