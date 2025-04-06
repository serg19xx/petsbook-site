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
  // Добавляем таймаут
  timeout: 10000,
  // Добавляем параметры для обработки ошибок
  validateStatus: function (status) {
    return status >= 200 && status < 500 // Обрабатываем все статусы как валидные
  },
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
    })
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    return Promise.reject(error)
  }
)

export default api
