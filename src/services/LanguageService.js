import { mockLanguageApi } from '@/api/mock'

export class LanguageService {
  static async detectUserLanguage() {
    try {
      // Get browser language
      const browserLang = navigator.language.split('-')[0]

      // Get IP-based location using mock API
      const geoData = await mockLanguageApi.detectGeoLocation()

      // Get system language
      const systemLang = window.navigator.systemLanguage || window.navigator.language

      return {
        browserLang,
        systemLang,
        geoLang: geoData.language,
        countryCode: geoData.countryCode,
      }
    } catch (error) {
      console.error('Error detecting language:', error)
      return { browserLang: 'en', systemLang: 'en', geoLang: 'en', countryCode: 'US' }
    }
  }

  static async getUserLanguagePreference() {
    try {
      // Using mock user ID for testing
      const mockUserId = localStorage.getItem('userId') || '1'
      return await mockLanguageApi.getUserLanguagePreference(mockUserId)
    } catch (error) {
      console.error('Error getting user language preference:', error)
      return null
    }
  }

  static async setUserLanguagePreference(language) {
    try {
      const mockUserId = localStorage.getItem('userId') || '1'
      return await mockLanguageApi.setUserLanguagePreference(mockUserId, language)
    } catch (error) {
      console.error('Error setting user language preference:', error)
      return false
    }
  }

  static async translateAndSaveLanguage(targetLang) {
    try {
      return await mockLanguageApi.translateAndSaveLanguage(targetLang)
    } catch (error) {
      console.error('Error translating language:', error)
      return null
    }
  }
}
