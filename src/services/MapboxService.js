const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export const mapboxService = {
  async searchLocation(query) {
    if (!query) return { features: [] }

    try {
      // Улучшенные параметры поиска для глобального охвата
      const params = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        types: 'address,place,locality,neighborhood,postcode',
        language: 'en',
        limit: 10, // Увеличиваем лимит результатов
        fuzzyMatch: true, // Включаем нечеткий поиск
        worldview: 'us', // Используем стандартный мировой вид
        autocomplete: true, // Включаем автодополнение
      })

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error in searchLocation:', error)
      return { features: [] }
    }
  },
}
