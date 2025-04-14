import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/AuthStore'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }

    return Promise.reject(error)
  },
)

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    resetPassword: '/auth/reset-password',
    requestReset: '/auth/request-reset',
  },
  user: {
    profile: '/user/profile',
    update: '/user/update',
    settings: '/user/settings',
  },
  pets: {
    list: '/pets',
    create: '/pets',
    update: (id) => `/pets/${id}`,
    delete: (id) => `/pets/${id}`,
    details: (id) => `/pets/${id}`,
  },
}

export default api

// Common API methods
export const apiService = {
  async login(credentials) {
    try {
      const response = await api.post(endpoints.auth.login, credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  async getProfile() {
    try {
      const response = await api.get(endpoints.user.profile)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile')
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put(endpoints.user.update, profileData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },
}
