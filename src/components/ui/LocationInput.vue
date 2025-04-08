<template>
  <div class="relative w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <div class="relative">
      <input
        ref="searchInput"
        type="text"
        v-model="searchQuery"
        class="input-base !border-gray-300"
        :class="[{ 'input-error': error }, '!border-gray-300', 'focus:!border-transparent']"
        :placeholder="placeholder"
        @focus="handleFocus"
        @input="handleInput"
      />
      <!-- Loading indicator -->
      <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <div
          class="w-5 h-5 border-2 border-primary-500 rounded-full animate-spin border-t-transparent"
        ></div>
      </div>
    </div>

    <!-- Dropdown list -->
    <div
      v-show="showDropdown"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <ul class="py-1">
        <li
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          @mousedown="handleSelect(suggestion)"
        >
          {{ suggestion.place_name }}
        </li>
      </ul>
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { mapboxService } from '@/services/MapboxService'

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
    default: 'Enter address to search',
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'location-selected'])

const searchInput = ref(null)
const searchQuery = ref(props.modelValue)
const suggestions = ref([])
const isLoading = ref(false)
const showDropdown = ref(false)
let debounceTimeout = null

const handleInput = async () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)

  if (searchQuery.value.length >= 2) {
    isLoading.value = true
    showDropdown.value = true

    debounceTimeout = setTimeout(async () => {
      try {
        const result = await mapboxService.searchLocation(searchQuery.value)
        suggestions.value = result.features
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

const handleFocus = () => {
  if (searchQuery.value.length >= 2 && suggestions.value.length > 0) {
    showDropdown.value = true
  }
}

// Добавим функцию для парсинга адреса
const parseAddress = (suggestion) => {
  // Получаем контекст и свойства места
  const context = suggestion.context || []
  const properties = suggestion.properties || {}

  // Инициализируем объект с адресными компонентами
  const addressComponents = {
    street: '',
    houseNumber: '',
    city: '',
    district: '',
    region: '',
    postcode: '',
    country: '',
    coordinates: suggestion.center || [],
  }

  // Парсим основной адрес
  if (suggestion.place_name) {
    const mainParts = suggestion.place_name.split(',').map((part) => part.trim())

    // Первая часть обычно содержит номер дома и улицу
    if (mainParts[0]) {
      const streetParts = mainParts[0].match(/^(\d+\w*)\s+(.+)/)
      if (streetParts) {
        addressComponents.houseNumber = streetParts[1]
        addressComponents.street = streetParts[2]
      } else {
        addressComponents.street = mainParts[0]
      }
    }
  }

  // Парсим контекст для получения остальных компонентов
  context.forEach((item) => {
    switch (item.id.split('.')[0]) {
      case 'place':
        addressComponents.city = item.text
        break
      case 'district':
        addressComponents.district = item.text
        break
      case 'region':
        addressComponents.region = item.text
        break
      case 'postcode':
        addressComponents.postcode = item.text
        break
      case 'country':
        addressComponents.country = item.text
        break
    }
  })

  // Если какие-то компоненты не найдены в контексте,
  // пытаемся извлечь их из properties
  if (properties) {
    if (!addressComponents.postcode && properties.postcode) {
      addressComponents.postcode = properties.postcode
    }
    if (!addressComponents.city && properties.city) {
      addressComponents.city = properties.city
    }
  }

  return addressComponents
}

const handleSelect = (suggestion) => {
  const addressComponents = parseAddress(suggestion)

  const locationData = {
    display_name: suggestion.place_name, // Добавляем это поле для совместимости
    fullAddress: suggestion.place_name,
    components: addressComponents,
    coordinates: suggestion.center,
    placeType: suggestion.place_type[0],
    bbox: suggestion.bbox,
    rawData: suggestion,
  }

  // Обновляем значение поля ввода
  searchQuery.value = suggestion.place_name
  // Эмитим оба события
  emit('update:modelValue', suggestion.place_name)
  emit('location-selected', locationData)
  showDropdown.value = false
  suggestions.value = []
}

const handleClickOutside = (event) => {
  if (searchInput.value && !searchInput.value.contains(event.target)) {
    showDropdown.value = false
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== searchQuery.value) {
      searchQuery.value = newValue
    }
  },
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
})

// Добавляем обработчик для немедленного обновления значения при вводе
watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue || '')
})
</script>

<style scoped>
.input-base {
  @apply border-gray-300;
}

/* Добавляем стили для состояния фокуса */
.input-base:focus {
  @apply border-transparent ring-2 ring-primary-500;
}

/* Стили для состояния ошибки */
.input-error {
  @apply border-red-500 focus:ring-red-500;
}
</style>
