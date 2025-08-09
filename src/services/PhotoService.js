/* eslint-disable no-undef */
import api from '@/api'
import { useUserStore } from '@/stores/UserStore'

console.log(import.meta.env.VITE_API_BASE_URL)
const API_URL = import.meta.env.VITE_API_BASE_URL

export const PhotoService = {
  async uploadPhoto(file, type) {
    try {
      const formData = new globalThis.FormData()
      formData.append('photo', file)

      const endpoint = type === 'avatar' ? '/user/avatar' : '/user/cover'

      // Альтернативный способ извлечения токена
      const cookies = document.cookie.split(';')
      let token = null
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'auth_token') {
          token = value
          break
        }
      }

      console.log('All cookies:', document.cookie)
      console.log('Extracted token:', token)

      const response = await api.post(endpoint, formData, {
        // Убираем Content-Type - браузер сам установит правильный для FormData
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        withCredentials: true,
      })

      if (response.data.success) {
        const userStore = useUserStore()

        // 1. Сначала обновим версию для немедленного cache-busting
        userStore.updateAvatarVersion() // Новый, простой action

        // 2. Затем, принудительно перезапросим все данные пользователя с сервера
        await userStore.fetchUserData(true) // Передаем `true` для принудительного обновления
      }

      return response.data
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  },

  async deletePhoto(photoId) {
    try {
      const response = await api.delete(`${API_URL}/photos/${photoId}`)

      return response.data
    } catch (error) {
      console.error('Error deleting photo:', error)
      throw error
    }
  },

  async getPhotos(userId) {
    try {
      const response = await api.get(`${API_URL}/photos/user/${userId}`)

      return response.data
    } catch (error) {
      console.error('Error fetching photos:', error)
      throw error
    }
  },
}

// Common API methods
export const apiService = {
  async login(credentials) {
    try {
      const response = await api.post(endpoints.auth.login, credentials)
      return {
        status: response.data.status || response.status,
        error_code: response.data.error_code || '',
        message: response.data.message || '',
        data: response.data.data || null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'LOGIN_FAILED',
        message: error.response?.data?.message || 'Login failed',
        data: null,
      }
    }
  },

  async getProfile() {
    try {
      const response = await api.get(endpoints.user.profile)
      return {
        status: response.data.status || response.status,
        error_code: response.data.error_code || '',
        message: response.data.message || '',
        data: response.data.data || null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'PROFILE_FETCH_FAILED',
        message: error.response?.data?.message || 'Failed to fetch profile',
        data: null,
      }
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put(endpoints.user.update, profileData)
      return {
        status: response.data.status || response.status,
        error_code: response.data.error_code || '',
        message: response.data.message || '',
        data: response.data.data || null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'PROFILE_UPDATE_FAILED',
        message: error.response?.data?.message || 'Failed to update profile',
        data: null,
      }
    }
  },
}
