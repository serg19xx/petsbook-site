// Моковые данные для тестирования
const mockUsers = [
  {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    avatar: '/default-avatar.png',
  },
]

// Имитация задержки сети
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Моковый API клиент
export const mockApi = {
  async login(credentials) {
    await delay(500) // Имитация задержки сети

    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return {
        data: {
          token: 'mock-token-123',
          user: mockUsers[0],
        },
      }
    }

    throw {
      response: {
        status: 401,
        data: {
          message: 'Invalid credentials',
        },
      },
    }
  },

  async register(userData) {
    await delay(500)
    return {
      data: {
        message: 'Registration successful',
      },
    }
  },

  async getMe() {
    await delay(300)
    return {
      data: mockUsers[0],
    }
  },

  async requestPasswordReset(email) {
    await delay(500)

    // Имитация проверки существования email
    if (email === 'test@example.com') {
      return {
        data: {
          message: 'Password reset instructions have been sent to your email',
        },
      }
    }

    throw {
      response: {
        status: 404,
        data: {
          message: 'User not found',
        },
      },
    }
  },

  async resetPassword(token, newPassword) {
    await delay(500)

    // Имитация проверки токена
    if (token === 'valid-token') {
      return {
        data: {
          message: 'Password has been successfully reset',
        },
      }
    }

    throw {
      response: {
        status: 400,
        data: {
          message: 'Invalid or expired reset token',
        },
      },
    }
  },
}

// Mock data for language and translations
const mockGeoData = {
  US: { language: 'en', countryCode: 'US', coordinates: { lat: 37.7749, lng: -122.4194 } },
  RU: { language: 'ru', countryCode: 'RU', coordinates: { lat: 55.7558, lng: 37.6173 } },
  UA: { language: 'uk', countryCode: 'UA', coordinates: { lat: 50.4501, lng: 30.5234 } },
  FR: { language: 'fr', countryCode: 'FR', coordinates: { lat: 48.8566, lng: 2.3522 } },
  ES: { language: 'es', countryCode: 'ES', coordinates: { lat: 40.4168, lng: -3.7038 } },
  CZ: { language: 'cs', countryCode: 'CZ', coordinates: { lat: 50.0755, lng: 14.4378 } },
}

// Mock translations data
const mockTranslations = {
  en: {
    navigation: {
      home: 'Home',
      explore: 'Explore',
      messages: 'Messages',
      profile: 'Profile',
      settings: 'Settings',
    },
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      error: 'Error occurred',
    },
  },
  ru: {
    navigation: {
      home: 'Главная',
      explore: 'Обзор',
      messages: 'Сообщения',
      profile: 'Профиль',
      settings: 'Настройки',
    },
    common: {
      welcome: 'Добро пожаловать',
      loading: 'Загрузка...',
      error: 'Произошла ошибка',
    },
  },
  uk: {
    navigation: {
      home: 'Головна',
      explore: 'Огляд',
      messages: 'Повідомлення',
      profile: 'Профіль',
      settings: 'Налаштування',
    },
    common: {
      welcome: 'Ласкаво просимо',
      loading: 'Завантаження...',
      error: 'Виникла помилка',
    },
  },
  fr: {
    navigation: {
      home: 'Accueil',
      explore: 'Explorer',
      messages: 'Messages',
      profile: 'Profil',
      settings: 'Paramètres',
    },
    common: {
      welcome: 'Bienvenue',
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
    },
  },
  es: {
    navigation: {
      home: 'Inicio',
      explore: 'Explorar',
      messages: 'Mensajes',
      profile: 'Perfil',
      settings: 'Ajustes',
    },
    common: {
      welcome: 'Bienvenido',
      loading: 'Cargando...',
      error: 'Se produjo un error',
    },
  },
  cs: {
    navigation: {
      home: 'Domů',
      explore: 'Prozkoumat',
      messages: 'Zprávy',
      profile: 'Profil',
      settings: 'Nastavení',
    },
    common: {
      welcome: 'Vítejte',
      loading: 'Načítání...',
      error: 'Došlo k chybě',
    },
  },
}

// Mock user language preferences
const mockUserLanguagePreferences = new Map()

// Mock Language API
export const mockLanguageApi = {
  async detectGeoLocation() {
    const cached = localStorage.getItem('geo_location')
    if (cached) {
      return JSON.parse(cached)
    }

    await delay(300)
    const countries = Object.keys(mockGeoData)
    const randomCountry = countries[Math.floor(Math.random() * countries.length)]
    const result = mockGeoData[randomCountry]

    localStorage.setItem('geo_location', JSON.stringify(result))
    return result
  },

  async getUserLanguagePreference(userId) {
    await delay(200)
    return mockUserLanguagePreferences.get(userId) || null
  },

  async setUserLanguagePreference(userId, language) {
    await delay(200)
    mockUserLanguagePreferences.set(userId, language)
    return true
  },

  async getTranslations(language) {
    await delay(400)
    if (mockTranslations[language]) {
      return mockTranslations[language]
    }

    // Имитация создания нового перевода
    if (!mockTranslations[language]) {
      const newTranslation = JSON.parse(JSON.stringify(mockTranslations.en))
      mockTranslations[language] = newTranslation
    }

    return mockTranslations[language]
  },

  async translateAndSaveLanguage(targetLang) {
    await delay(600)
    if (mockTranslations[targetLang]) {
      return mockTranslations[targetLang]
    }

    const newTranslation = JSON.parse(JSON.stringify(mockTranslations.en))
    mockTranslations[targetLang] = newTranslation
    return newTranslation
  },
}
