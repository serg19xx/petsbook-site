import axios from 'axios'
import { handleApiResponse } from '@/utils/apiResponseHandler'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    handleApiResponse.error.handle(error)
    return Promise.reject(error)
  },
)

export default api
