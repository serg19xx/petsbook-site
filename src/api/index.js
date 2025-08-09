/* eslint-disable no-undef */
import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/AuthStore'

axios.defaults.withCredentials = true
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  function(config) {
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  function(error) {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  function(response) {
    if (import.meta.env.DEV) {
      console.log('✅ API Success:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        hasAuthToken: document.cookie.includes('auth_token='),
        timestamp: new Date().toISOString(),
      })
    }
    return response
  },
  function(error) {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      hasAuthToken: document.cookie.includes('auth_token='),
      timestamp: new Date().toISOString(),
    })

    // Улучшенная логика для 401 ошибок
    if (error.response?.status === 401) {
      console.warn('🚨 401 Unauthorized detected for:', error.config?.url)
      console.warn('🍪 Current cookies:', document.cookie)

      const authStore = useAuthStore()
      const isCurrentlyAuthenticated = authStore.isAuthenticated
      const hasLoginInfo = !!authStore.loginInfo

      console.log('🔍 Auth state check:', {
        isAuthenticated: isCurrentlyAuthenticated,
        hasLoginInfo: hasLoginInfo,
        url: error.config?.url,
      })

      const isProtectedEndpoint =
        !error.config?.url?.includes('/api/pets/') &&
        !error.config?.url?.includes('/api/user/getuser')

      if (isCurrentlyAuthenticated && isProtectedEndpoint) {
        console.warn('🚪 401 error on protected endpoint - logging out user')
        authStore.logout()
        router.push('/login')
      } else {
        console.warn('🔄 401 error but not logging out - either not authenticated or public endpoint')
      }
    } else if (error.response?.status === 403) {
      console.warn('🚨 403 Forbidden detected for:', error.config?.url)

      const errorCode = error.response?.data?.error_code
      if (errorCode !== 'EMAIL_NOT_VERIFIED') {
        const authStore = useAuthStore()
        console.warn('🚪 403 error - logging out user')
        authStore.logout()
        router.push('/login')
      } else {
        console.warn('🔄 403 EMAIL_NOT_VERIFIED - not logging out')
      }
    }

    return Promise.reject(error)
  },
)

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
