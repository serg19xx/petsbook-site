/* eslint-env browser, node */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'
import { useAuthStore } from './AuthStore'

export const useUserStore = defineStore('user', () => {
  // console.log('fetchUserData called')

  const userData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => !!userData.value && !!userData.value.id)

  const fetchUserData = async () => {
    if (loading.value || userData.value) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/user/getuser', { withCredentials: true })
      console.log('Raw server response:', response)

      const fetchedUser = response.data?.data
      console.log('Fetched user data:', fetchedUser)

      if (!fetchedUser) {
        console.error('No user data found in response')
        throw new Error('Invalid response structure')
      }

      // Проверяем наличие обязательных полей
      if (!fetchedUser.id) {
        console.error('User data missing required field: id')
        throw new Error('Invalid user data structure')
      }

      userData.value = fetchedUser
      authStore.loginInfo.avatar = fetchedUser.avatar
      console.log('Updated store with user data:', userData.value)
      return {
        success: true,
        data: fetchedUser,
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err)
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
    if (loading.value) {
      return { success: false, error: 'Already loading' }
    }

    loading.value = true
    error.value = null

    try {
      //console.log('BEFORE API:')
      const response = await api.put('/user/update', updateData, {
        withCredentials: true,
      })
      //console.log('========Server response:', response.data) // Добавляем лог

      // Проверяем успешность ответа сервера
      if (response.status === 200 || response.data?.status === 200) {
        // Сначала обновляем локальные данные
        userData.value = {
          ...userData.value,
          ...updateData,
          avatar: updateData.avatar || userData.value.avatar,
          cover: updateData.cover || userData.value.cover,
        }

        await fetchUserData()

        //console.log('Returning success response') // Добавляем лог
        return {
          success: true,
          message: response.data?.message || 'Profile updated successfully',
        }
      } else {
        //console.log('Returning error response') // Добавляем лог
        return {
          // Изменено здесь
          success: false,
          error: response.data?.message || 'Failed to update user data',
        }
      }
    } catch (err) {
      //console.error('Update error:', err) // Добавляем лог
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
    isAuthenticated,
  }
})
