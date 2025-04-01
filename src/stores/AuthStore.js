import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const token = ref(localStorage.getItem('token') || null)

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      isAuthenticated.value = true
      localStorage.setItem('token', token.value)
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Authentication failed',
      }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
  }

  const verify2FA = async ({ email, code }) => {
    try {
      const response = await api.post('/auth/verify-2fa', { email, code })
      if (response.data.success) {
        // Установка токена и данных пользователя после успешной 2FA
        setToken(response.data.token)
        setUser(response.data.user)
      }
      return response.data
    } catch (error) {
      console.error('2FA verification error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка проверки 2FA',
      }
    }
  }

  const register = async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password })
      return {
        success: true,
        message: 'Регистрация успешна',
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка при регистрации',
      }
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      const response = await api.post('/auth/request-reset', { email })
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error) {
      console.error('Password reset request error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset request',
      }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword,
      })
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      }
    }
  }

  const enable2FA = async () => {
    try {
      const response = await api.post('/auth/2fa/enable')
      return response.data
    } catch (error) {
      console.error('Enable 2FA error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка включения 2FA',
      }
    }
  }

  const disable2FA = async () => {
    try {
      const response = await api.post('/auth/2fa/disable')
      return response.data
    } catch (error) {
      console.error('Disable 2FA error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка отключения 2FA',
      }
    }
  }

  const get2FAStatus = async () => {
    try {
      const response = await api.get('/auth/2fa/status')
      return response.data
    } catch (error) {
      console.error('Get 2FA status error:', error)
      return {
        enabled: false,
        error: true,
      }
    }
  }

  return {
    user,
    isAuthenticated,
    token,
    login,
    logout,
    verify2FA,
    register,
    requestPasswordReset,
    resetPassword,
    enable2FA,
    disable2FA,
    get2FAStatus,
  }
})
