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
      //const fetchedUser = response.data?.data.user
      let fetchedUser = null
      if (response.data?.data?.user) {
        fetchedUser = response.data.data.user
      } else if (response.data?.data) {
        fetchedUser = response.data.data
      } else if (response.data?.user) {
        fetchedUser = response.data.user
      }
      console.log('@@@@@@ fetchedUser @@@@@@', fetchedUser)
      console.log(
        '========Server response in fetchUserData:',
        JSON.parse(JSON.stringify(response.data)),
      ) // Добавляем лог

      console.log('========fetchedUser:', JSON.parse(JSON.stringify(fetchedUser)))

      if (!fetchedUser) {
        throw new Error('Invalid response structure')
      }

      userData.value = fetchedUser
      authStore.loginInfo.avatar = fetchedUser.avatar
      console.log('========Updated userData in store:', JSON.parse(JSON.stringify(userData.value))) // Добавляем лог
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
