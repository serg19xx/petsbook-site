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

      const response = await api.post(
        '/user/upload-avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
        { withCredentials: true },
      )
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

      const response = await api.post(
        '/user/cover',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
        { withCredentials: true },
      )
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
