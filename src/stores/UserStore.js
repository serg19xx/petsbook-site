import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  const userData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchUserData = async () => {
    if (loading.value || userData.value) return
    console.log('fetchUserData', Date.now())
    if (loading.value) return { success: false, error: 'Already loading' }
    console.log('US 1: Fetching user data')
    loading.value = true
    error.value = null
    console.log('US 2: BEARER', api.defaults.headers.common['Authorization'])
    try {
      const response = await api.get('/user/getuser')
      const fetchedUser = response.data?.data?.user
      console.log('US 2: Fetched user data:', fetchedUser)
      if (!fetchedUser) {
        throw new Error('Invalid response structure')
      }

      userData.value = fetchedUser
      console.log('US 3: User data received:', userData)
      localStorage.setItem('userData', JSON.stringify(fetchedUser))

      return {
        success: true,
        data: fetchedUser,
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user data'
      console.error('Fetch user data error:', err)
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
      const response = await api.put('/user/update', updateData)

      // Обновляем данные в любом случае, если получили ответ от сервера
      const currentData = userData.value || {}
      userData.value = {
        ...currentData,
        ...updateData,
      }

      // Всегда возвращаем успех, если получили ответ
      return {
        success: true,
        message: response.data?.message || 'Profile updated successfully',
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update user data'
      console.error('Error updating user data:', err)
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