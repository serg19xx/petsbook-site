import api from './index'

export const profileApi = {
  // Получение данных профиля
  getProfile: async () => {
    try {
      const response = await api.get('/user/getuser', { withCredentials: true })
      return {
        status: response.data.status || response.status,
        error_code: response.data.error_code || '',
        message: response.data.message || '',
        data: response.data.data?.user || null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'PROFILE_FETCH_FAILED',
        message: error.response?.data?.message || 'Failed to fetch profile data',
        data: null,
      }
    }
  },

  // Обновление данных профиля
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/update', profileData, { withCredentials: true })
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

  // Загрузка аватара
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      // Извлекаем токен из кук
      const cookies = document.cookie.split(';')
      let token = null
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'auth_token') {
          token = value
          break
        }
      }

      const response = await api.post('/user/upload-avatar', formData, {
        withCredentials: true,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
      return {
        status: response.data.status || response.status,
        error_code: response.data.error_code || '',
        message: response.data.message || '',
        data: response.data.data?.avatar || null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'AVATAR_UPLOAD_FAILED',
        message: error.response?.data?.message || 'Failed to upload avatar',
        data: null,
      }
    }
  },

  // Загрузка подложки
  uploadCover: async (file) => {
    try {
      const formData = new FormData()
      formData.append('cover', file)

      // Извлекаем токен из кук
      const cookies = document.cookie.split(';')
      let token = null
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'auth_token') {
          token = value
          break
        }
      }

      const response = await api.post('/user/cover', formData, {
        withCredentials: true,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
      return {
        success: true,
        data: response.data.data.cover,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload cover',
      }
    }
  },
}
