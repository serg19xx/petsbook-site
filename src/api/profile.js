import api from './axios'

export const profileApi = {
  // Получение данных профиля
  async getProfile(userId = null) {
    const endpoint = userId ? `/profile/${userId}` : '/profile'
    try {
      const response = await api.get(endpoint)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile')
    }
  },

  // Обновление профиля
  async updateProfile(profileData) {
    try {
      const response = await api.put('/profile', profileData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  // Загрузка аватара
  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload avatar')
    }
  },

  // Загрузка фонового изображения
  async uploadCover(file) {
    const formData = new FormData()
    formData.append('cover', file)

    try {
      const response = await api.post('/profile/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload cover')
    }
  },
}
