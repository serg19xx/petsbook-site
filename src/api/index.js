/* eslint-disable no-undef */
import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/AuthStore'

axios.defaults.withCredentials = true
console.log(import.meta.env.VITE_API_BASE_URL)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response Details:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      })
    }
    return response
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      })
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      //notify('У вас нет доступа к этому ресурсу')
      router.push('/login')
    } else if (error.response?.status === 403) {
      const authStore = useAuthStore()
      authStore.logout()
      //notify('У вас нет доступа к этому ресурсу')
      router.push('/login')
    }

    return Promise.reject(error)
  },
)

// API endpoints
/*
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
  stats: {
    visit: '/stats/visit',
  },
}
*/

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

  async trackVisit(payload) {
    try {
      await api.post(endpoints.stats.visit, payload)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to track visit', error)
      }
    }
  },
}
