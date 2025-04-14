import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  const userData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchUserData = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/user/getuser')

      // Проверяем структуру ответа и наличие данных
      if (response?.data?.status === 200 && response?.data?.data?.user) {
        // Сохраняем данные пользователя
        userData.value = response.data.data.user
        console.log('User data received:', userData.value)
        return {
          success: true,
          data: userData.value,
        }
      }

      // Если структура ответа не соответствует ожидаемой
      throw new Error('Invalid response structure')
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user data'
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  const updateUserData = async (updateData) => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const response = await api.put('/user/update', updateData)

      if (response?.data?.status === 200 && response?.data?.data?.user) {
        // Обновляем данные пользователя в сторе
        userData.value = response.data.data.user
        return {
          success: true,
          data: userData.value,
        }
      }

      throw new Error('Invalid response structure')
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update user data'
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  const clearUserData = () => {
    userData.value = null
    error.value = null
  }

  return {
    userData,
    loading,
    error,
    fetchUserData,
    updateUserData,
    clearUserData,
  }
})
