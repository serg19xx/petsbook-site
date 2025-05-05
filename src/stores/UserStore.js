/* eslint-env browser, node */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  // console.log('fetchUserData called')

  const userData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!userData.value && !!userData.value.id)

  const fetchUserData = async () => {
    if (loading.value || userData.value) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/user/getuser', { withCredentials: true })
      const fetchedUser = response.data?.data.user

      // console.log('fetchedUser:', fetchedUser)

      if (!fetchedUser) {
        throw new Error('Invalid response structure')
      }

      userData.value = fetchedUser

      return {
        success: true,
        data: fetchedUser,
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user data'
      if (err.response?.status !== 401) {
        // console.error('Fetch user data error:', err)
      }
      // 401 можно не логировать, если это ожидаемое поведение
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  const updateUserData = async (updateData) => {
    if (loading.value) {
      return { success: false, error: 'Already loading' }
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.put('/user/update', updateData, {
        withCredentials: true,
      })

      // Проверяем успешность ответа сервера
      if (response.data?.success) {
        userData.value = {
          ...userData.value,
          ...updateData,
        }
        return {
          success: true,
          message: response.data?.message || 'Profile updated successfully',
        }
      } else {
        throw new Error(response.data?.message || 'Failed to update user data')
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update user data'
      if (err.response?.status !== 401) {
        // console.error('Error updating user data:', err)
      }
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
    isAuthenticated,
  }
})
