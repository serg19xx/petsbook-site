import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useUserStore = defineStore('user', () => {
  // Инициализируем userData из localStorage
  const userData = ref(JSON.parse(localStorage.getItem('userData')) || null)
  const loading = ref(false)
  const error = ref(null)

  const fetchUserData = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/user/getuser')
      if (response.data.success && response.data.user) {
        userData.value = response.data.user
        // Сохраняем данные в localStorage
        localStorage.setItem('userData', JSON.stringify(response.data.user))
        return {
          success: true,
          data: response.data.user,
        }
      } else {
        throw new Error('Invalid response format')
      }
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
    localStorage.removeItem('userData') // Очищаем данные из localStorage
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
