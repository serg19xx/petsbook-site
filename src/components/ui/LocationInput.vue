<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <!-- Location fields container -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-2">
      <!-- Address input -->
      <div class="relative lg:col-span-9">
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          class="input-base w-full"
          :class="[{ 'input-error': error }]"
          :placeholder="placeholder || ''"
          @input="handleInput"
        />

        <!-- Loading indicator -->
        <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
          <div class="w-5 h-5 border-2 border-primary-500 rounded-full animate-spin border-t-transparent"></div>
        </div>

        <!-- Suggestions dropdown -->
        <div
          v-if="showDropdown && suggestions.length > 0"
          class="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200"
        >
          <ul class="py-1">
            <li
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              @click="handleSelect(suggestion)"
            >
              {{ suggestion.place_name }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Unit/Apartment input -->
      <div class="lg:col-span-3">
        <input
          v-model="unitNumber"
          type="text"
          class="input-base w-full"
          :placeholder="$t('location.unit_placeholder')"
          @input="handleUnitChange"
        />
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { mapboxService } from '@/services/MapboxService'
import { getAlpha3RegionCode } from '@/utils/regionCodes'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  }
})

const emit = defineEmits(['update:modelValue', 'location-selected'])

const searchQuery = ref(props.modelValue || '')
const unitNumber = ref('')
const suggestions = ref([])
const isLoading = ref(false)
const showDropdown = ref(false)
let debounceTimeout = null

// Храним текущую локацию
const currentLocation = ref({
  fullAddress: '',
  coordinates: {
    lat: 0,
    lng: 0
  },
  components: {}
})

const handleInput = async () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)

  if (searchQuery.value.length >= 2) {
    isLoading.value = true
    showDropdown.value = true

    debounceTimeout = setTimeout(async () => {
      try {
        const result = await mapboxService.searchLocation(searchQuery.value)
        suggestions.value = result.features || []
      } catch (error) {
        console.error('Search error:', error)
        suggestions.value = []
      } finally {
        isLoading.value = false
      }
    }, 300)
  } else {
    suggestions.value = []
    showDropdown.value = false
    isLoading.value = false
  }
}

const handleSelect = (suggestion) => {
  searchQuery.value = suggestion.place_name

  // Разбираем данные из suggestion
  const context = suggestion.context || []

  // Получаем коды стран и региона
  const countryContext = context.find(item => item.id.includes('country'))
  const regionContext = context.find(item => item.id.includes('region'))

  // Извлекаем country_code2 из свойства short_code контекста страны (например, 'au' -> 'AU')
  const country_code2 = (countryContext?.short_code || '').toUpperCase()

  // Получаем region_code из short_code региона (например, 'AU-QLD')
  const region_code = regionContext?.short_code || ''

  const address = {
    street: suggestion.text || '',
    houseNumber: suggestion.address || '',
    city: context.find(item => item.id.includes('place'))?.text || '',
    region: regionContext?.text || '',
    country: countryContext?.text || '',
    postcode: context.find(item => item.id.includes('postcode'))?.text || '',
    // Оставляем только основные коды
    country_code2: country_code2,
    region_code: region_code
  }

  // Формируем полный адрес
  const fullAddress = [
    address.houseNumber,
    address.street,
    address.city,
    address.region,
    address.postcode,
    address.country
  ].filter(Boolean).join(', ')

  // Обновляем текущую локацию
  currentLocation.value = {
    fullAddress: fullAddress,
    coordinates: {
      lat: suggestion.center[1],
      lng: suggestion.center[0]
    },
    components: {
      ...address,
      unitNumb: unitNumber.value || ''
    }
  }

  emit('update:modelValue', fullAddress)
  emit('location-selected', currentLocation.value)

  showDropdown.value = false
  suggestions.value = []
}

const handleUnitChange = () => {
  if (!currentLocation.value.fullAddress) {
    return
  }

  const locationData = {
    ...currentLocation.value,
    components: {
      ...currentLocation.value.components,
      unitNumb: unitNumber.value || ''
    }
  }

  emit('location-selected', locationData)
}

// Сброс данных при очистке поля поиска
watch(searchQuery, (newValue) => {
  if (!newValue) {
    currentLocation.value = {
      fullAddress: '',
      coordinates: {
        lat: 0,
        lng: 0
      },
      components: {
        unitNumb: unitNumber.value || ''
      }
    }
  }
})
</script>

<style scoped>
.input-base {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         transition-all duration-200;
}

.input-error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}
</style>
