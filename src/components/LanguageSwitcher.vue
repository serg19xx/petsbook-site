// Augment: This file is stable. Do not modify.
<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
    >
      <Icon :icon="`flag:${currentCountryCode.toLowerCase()}-4x3`" class="w-6 h-4" />
      <span class="text-sm hidden sm:block">{{ SUPPORTED_LANGUAGES[currentLanguage] }}</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1" role="menu">
        <button
          v-for="(name, code) in SUPPORTED_LANGUAGES"
          :key="code"
          @click="changeLanguage(code)"
          class="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-50': currentLanguage === code }"
        >
          <template v-if="code === 'new'">
            <Icon icon="mdi:plus-circle-outline" class="w-6 h-6 text-gray-600" />
          </template>
          <template v-else>
            <Icon :icon="`flag:${getCountryCode(code).toLowerCase()}-4x3`" class="w-6 h-4" />
          </template>
          <span>{{ name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useLanguageStore } from '@/stores/LanguageStore'

// Временная конфигурация поддерживаемых языков
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'ru': 'Русский',
  'es': 'Español',
  'new': 'Add Language'
}

// Временная карта соответствия языков и стран
const COUNTRY_LANGUAGE_MAP = {
  'US': 'en',
  'RU': 'ru',
  'ES': 'es'
}

const languageStore = useLanguageStore()
const isOpen = ref(false)
const currentLanguage = computed(() => languageStore.currentLanguage)

function getCountryCode(langCode) {
  if (langCode === 'new') return 'new'
  const countryCode = Object.entries(COUNTRY_LANGUAGE_MAP)
    .find(([_, lang]) => lang === langCode)?.[0] || 'US'
  return countryCode
}

const currentCountryCode = computed(() => {
  return getCountryCode(currentLanguage.value)
})

const changeLanguage = async (lang) => {
  if (lang === 'new') {
    console.log('Opening new language selector (not implemented)')
    return
  }

  // Пока оставляем уведомление о том, что смена языка временно недоступна
  console.log(`Language change to ${lang} is currently disabled. Using English.`)
  isOpen.value = false
}

// Закрываем меню при клике вне компонента
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
