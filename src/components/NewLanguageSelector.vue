<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Выбор нового языка</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Search input -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск страны или языка..."
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Countries list grouped by region -->
      <div class="max-h-[60vh] overflow-y-auto">
        <div v-for="(countries, region) in filteredCountries" :key="region">
          <h3 class="font-semibold text-gray-700 py-2">{{ region }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="country in countries"
              :key="country.code"
              @click="selectCountry(country)"
              class="flex items-center p-2 rounded-lg hover:bg-gray-100"
            >
              <Icon :icon="country.flag" class="w-6 h-6 mr-2" />
              <div class="flex flex-col items-start">
                <span class="text-sm font-medium">{{ country.name }}</span>
                <span class="text-xs text-gray-500">
                  {{ country.languages.map((l) => l.name).join(', ') }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { getCountriesByRegion } from '@/api/countryData'
import { useLanguageStore } from '@/stores/LanguageStore'

const emit = defineEmits(['close', 'languageAdded'])
const languageStore = useLanguageStore()
const searchQuery = ref('')

const filteredCountries = computed(() => {
  const countries = getCountriesByRegion()
  if (!searchQuery.value) return countries

  const query = searchQuery.value.toLowerCase()
  const filtered = {}

  Object.entries(countries).forEach(([region, regionCountries]) => {
    const matchedCountries = regionCountries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.languages.some((lang) => lang.name.toLowerCase().includes(query)),
    )

    if (matchedCountries.length > 0) {
      filtered[region] = matchedCountries
    }
  })

  return filtered
})

const selectCountry = (country) => {
  // Если у страны несколько языков, можно добавить дополнительный выбор
  const language = country.languages[0]
  languageStore.addNewLanguage(language.code)
  emit('languageAdded', language.code)
}
</script>
