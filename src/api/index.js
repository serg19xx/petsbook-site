/* eslint-disable no-undef */
import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/AuthStore'

axios.defaults.withCredentials = true
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    // Убираем Content-Type - он будет устанавливаться автоматически
    // 'Content-Type': 'application/json', // УБРАНО
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Устанавливаем Content-Type только для JSON запросов
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    // Убираем добавление Bearer token - используем только куки
    // const token = getCookie('auth_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
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

    // Не делаем logout для API питомцев при 401
    if (error.response?.status === 401 && error.config?.url?.includes('/api/pets/')) {
      console.warn('401 error for pets API - not logging out')
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      //notify('У вас нет доступа к этому ресурсу')
      router.push('/login')
    } else if (error.response?.status === 403) {
      // Не обрабатываем 403 автоматически для EMAIL_NOT_VERIFIED
      // Позволяем компонентам обработать эту ошибку самостоятельно
      const errorCode = error.response?.data?.error_code
      if (errorCode !== 'EMAIL_NOT_VERIFIED') {
        const authStore = useAuthStore()
        authStore.logout()
        //notify('У вас нет доступа к этому ресурсу')
        router.push('/login')
      }
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
      return {
        status: response.data.status || response.status,
        error_code: response.data.error_code || '',
        message: response.data.message || '',
        data: response.data.data || null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'LOGIN_FAILED',
        message: error.response?.data?.message || 'Login failed',
        data: null,
      }
    }
  },

  async getProfile() {
    try {
      const response = await api.get(endpoints.user.profile)
      return {
        status: response.data.status || response.status,
        error_code: response.data.error_code || '',
        message: response.data.message || '',
        data: response.data.data || null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'PROFILE_FETCH_FAILED',
        message: error.response?.data?.message || 'Failed to fetch profile',
        data: null,
      }
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put(endpoints.user.update, profileData)
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

  async trackVisit(payload) {
    try {
      await api.post('/api/stats/visit', payload)
      return {
        status: 200,
        error_code: '',
        message: '',
        data: null,
      }
    } catch (error) {
      return {
        status: error.response?.data?.status || 500,
        error_code: error.response?.data?.error_code || 'TRACK_VISIT_FAILED',
        message: error.response?.data?.message || 'Failed to track visit',
        data: null,
      }
    }
  },
}
