/* eslint-env browser, node */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'
import { useAuthStore } from './AuthStore'

export const useUserStore = defineStore('user', () => {
  const userData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // 1. При инициализации, читаем версию из localStorage, или ставим 1 по умолчанию.
  const avatarVersion = ref(parseInt(localStorage.getItem('avatarVersion') || '1', 10))
  const coverVersion = ref(parseInt(localStorage.getItem('coverVersion') || '1', 10))
  const defaultAvatar = ref(null)

  const isAuthenticated = computed(() => !!userData.value && !!userData.value.id)

  const fetchUserData = async () => {
    // Эта функция больше не управляет isReady.
    // Она просто получает данные и устанавливает состояние аутентификации.
    loading.value = true
    try {
      const response = await api.get('/user/getuser', { withCredentials: true })
      userData.value = response.data?.data

      if (userData.value) {
        authStore.isAuthenticated = true
        // authStore.loginInfo = { ...authStore.loginInfo, avatar: userData.value.avatar } // УДАЛЯЕМ ЭТО
      } else {
        authStore.isAuthenticated = false
        userData.value = null
      }
    } catch (err) {
      console.error('Failed to fetch user data, treating as guest.', err)
      userData.value = null
      authStore.isAuthenticated = false
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
    // isReady.value = false // This was already removed, which is good.

    // При выходе из системы, НЕ очищаем версии.
    // Они привязаны к файлам на сервере и должны сохраняться между сессиями.
    // localStorage.removeItem('avatarVersion')
    // localStorage.removeItem('coverVersion')
    // avatarVersion.value = 1
    // coverVersion.value = 1
  }

  const updateAvatarUrl = (newAvatarPath) => {
    if (userData.value) {
      userData.value.avatar = newAvatarPath
      // 2. Увеличиваем версию и СОХРАНЯЕМ ее в localStorage.
      avatarVersion.value++
      localStorage.setItem('avatarVersion', avatarVersion.value.toString())
    }
  }

  const updateAvatarVersion = () => {
    avatarVersion.value++
    localStorage.setItem('avatarVersion', avatarVersion.value.toString())
  }

  const updateCoverVersion = () => {
    coverVersion.value++
    localStorage.setItem('coverVersion', coverVersion.value.toString())
  }

  const getAvatarUrl = computed(() => {
    if (userData.value?.avatar) {
      return `${userData.value.avatar}?v=${avatarVersion.value}`
    }
    return defaultAvatar
  })

  const getCoverUrl = computed(() => {
    if (userData.value?.cover) {
      return `${userData.value.cover}?v=${coverVersion.value}`
    }
    return null
  })

  return {
    userData,
    loading,
    error,
    fetchUserData,
    updateUserData,
    clearUserData,
    isAuthenticated,
    updateAvatarUrl,
    updateAvatarVersion,
    updateCoverVersion,
    getAvatarUrl,
    getCoverUrl,
  }
})
