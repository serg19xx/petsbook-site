import api from './index'

export const profileApi = {
  // Получение данных профиля
  getProfile: async () => {
    try {
      const response = await api.get('/user/getuser')
      return {
        success: true,
        data: response.data.data.user,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile data',
      }
    }
  },

  // Обновление данных профиля
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/update', profileData)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
      }
    }
  },

  // Загрузка аватара
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.post('/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return {
        success: true,
        data: response.data.data.avatar,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload avatar',
      }
    }
  },

  // Загрузка подложки
  uploadCover: async (file) => {
    try {
      const formData = new FormData()
      formData.append('cover', file)

      const response = await api.post('/user/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
