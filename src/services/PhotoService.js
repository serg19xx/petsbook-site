import axios from 'axios'
import { useUserStore } from '@/stores/UserStore'
import api from '@/api'

const API_URL = import.meta.env.VITE_API_URL

export const PhotoService = {
  async uploadPhoto(file, type) {
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const endpoint = type === 'avatar' ? '/user/avatar' : '/user/cover'

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  },

  async deletePhoto(photoId) {
    try {
      const response = await axios.delete(`${API_URL}/photos/${photoId}`)

      return response.data
    } catch (error) {
      console.error('Error deleting photo:', error)
      throw error
    }
  },

  async getPhotos(userId) {
    try {
      const response = await axios.get(`${API_URL}/photos/user/${userId}`)

      return response.data
    } catch (error) {
      console.error('Error fetching photos:', error)
      throw error
    }
  },
}
