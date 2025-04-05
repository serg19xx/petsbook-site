import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Добавим логирование запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
      })
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Улучшим обработку ответов
api.interceptors.response.use(
  (response) => {
    // Логируем успешные ответы только в development
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', {
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  (error) => {
    // Для блокировки аккаунта возвращаем специальный формат
    if (error.response?.status === 400 && error.response?.data?.error_code === 'ACCOUNT_BLOCKED') {
      // Подавляем вывод ошибки в консоль
      error.preventDefault?.()

      return {
        status: 200, // Меняем статус на 200
        data: {
          success: false,
          error_code: 'ACCOUNT_BLOCKED',
          message: 'Ваш аккаунт заблокирован. Пожалуйста, обратитесь в службу поддержки.',
        },
      }
    }

    // Логируем остальные ошибки только в development
    if (process.env.NODE_ENV === 'development') {
      console.log('Error Response:', {
        status: error.response?.status,
        data: error.response?.data,
      })
    }

    return Promise.reject(error)
  },
)

export default api
