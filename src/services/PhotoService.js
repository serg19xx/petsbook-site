import axios from 'axios'
import { useUserStore } from '@/stores/UserStore'

const API_URL = import.meta.env.VITE_API_URL

export const PhotoService = {
  async uploadPhoto(file, type) {
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('type', type)

      const response = await axios.post(`${API_URL}/photos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${useUserStore().token}`,
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
      const response = await axios.delete(`${API_URL}/photos/${photoId}`, {
        headers: {
          Authorization: `Bearer ${useUserStore().token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error('Error deleting photo:', error)
      throw error
    }
  },

  async getPhotos(userId) {
    try {
      const response = await axios.get(`${API_URL}/photos/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${useUserStore().token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error('Error fetching photos:', error)
      throw error
    }
  },
}
