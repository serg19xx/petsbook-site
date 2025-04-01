import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const api = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Добавим имитацию API для разработки
const mockApi = {
  async login(credentials) {
    // Имитация задержки
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Проверка тестовых данных
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return {
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      }
    }

    throw {
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    }
  },

  async get(url) {
    // Имитация задержки
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (url === '/auth/me') {
      return {
        data: JSON.parse(localStorage.getItem('user')),
      }
    }

    throw new Error('Not implemented')
  },
}

export default mockApi
