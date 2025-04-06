import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useUserStore = defineStore('user', () => {
  const userData = ref(JSON.parse(localStorage.getItem('userData')) || null)
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
        userData.value = response.data.data.user
        localStorage.setItem('userData', JSON.stringify(response.data.data.user))
        return {
          success: true,
          data: response.data.data.user,
        }
      }

      // Если структура ответа не соответствует ожидаемой
      throw new Error('Invalid response structure')
    } catch (err) {
      console.error('Error fetching user data:', err)
      error.value = err.response?.data?.message || 'Failed to fetch user data'

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
    localStorage.removeItem('userData')
    error.value = null
  }

  return {
    userData,
    loading,
    error,
    fetchUserData,
    clearUserData,
  }
})
