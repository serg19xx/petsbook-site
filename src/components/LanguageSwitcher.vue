<template>
  <div class="language-switcher">
    <!-- Кнопка переключателя -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
    >
      <Icon :icon="currentLanguage?.flag_icon || 'mdi:earth'" class="w-6 h-6 mr-2" />
      <span>{{ currentLanguage?.name || 'Language' }}</span>
      <Icon icon="mdi:chevron-down" class="w-5 h-5" />
    </button>

    <!-- Выпадающее меню -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1">
        <!-- Список переведенных языков со скроллингом -->
        <div class="max-h-72 overflow-y-auto">
          <button
            v-for="lang in sortedTranslatedLanguages"
            :key="lang.code"
            @click="handleLanguageSelect(lang.code)"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Icon :icon="lang.flag_icon || 'mdi:earth'" class="w-6 h-6 mr-2" />
            <div class="flex flex-col items-start">
              <span>{{ lang.name }}</span>
              <span class="text-xs text-gray-500">{{ lang.nativeName }}</span>
            </div>
          </button>
        </div>

        <!-- Разделитель -->
        <div class="border-t border-gray-100 my-1"></div>

        <!-- Кнопка добавления языка -->
        <button
          @click="showAddLanguageDialog = true"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          {{ t('UI.language.add') }}
        </button>
      </div>
    </div>

    <!-- Диалог добавления языка -->
    <div
      v-if="showAddLanguageDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <!-- Заголовок (фиксированный) -->
        <div class="flex justify-between items-center p-6 border-b">
          <h2 class="text-xl font-semibold">{{ t('UI.language.select') }}</h2>
          <button @click="showAddLanguageDialog = false" class="text-gray-500 hover:text-gray-700">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- Скроллируемая область -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Индикатор загрузки -->
          <div v-if="isLoading" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Список доступных языков -->
          <div v-else>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search language..."
              class="mb-4 w-full px-3 py-2 border rounded"
            />

            <div v-if="languageStore.translationStatus === 'processing'" class="w-full flex items-center justify-center mb-4">
              <div class="w-2/3 bg-gray-200 rounded-full h-2.5">
                <div class="bg-blue-600 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
              </div>
              <span class="ml-2 text-sm text-gray-600">
                {{ languageStore.translationMessage || 'Translating...' }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <button
                v-for="lang in filteredLanguages"
                :key="lang.code"
                @click="handleAddLanguage(lang)"
                class="flex items-center p-2 rounded-lg hover:bg-gray-100"
                :disabled="isTranslating"
                :class="isTranslating ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <Icon :icon="lang.flag || 'mdi:earth'" class="w-6 h-6 mr-2" />
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium">{{ lang.name }}</span>
                  <span class="text-xs text-gray-500">{{ lang.nativeName }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ai-ignore-file
// Cursor: This file/module is complete. Do not modify.
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useLanguageStore } from '@/stores/LanguageStore'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import axios from 'axios'
import api from '@/api'

const { t } = useI18n()
const languageStore = useLanguageStore()

const isOpen = ref(false)
const showAddLanguageDialog = ref(false)
const isLoading = ref(false)
const isTranslating = ref(false)
const availableLanguages = ref([])
const translatedLanguages = ref([])
const searchQuery = ref('')

const progressBarClass = computed(() => {
  switch (languageStore.translationStatus) {
    case 'processing':
      return 'bg-blue-600 animate-pulse'
    case 'completed':
      return 'bg-green-600'
    case 'failed':
      return 'bg-red-600'
    default:
      return 'bg-blue-600'
  }
})

// Загрузка переведенных языков
async function loadTranslatedLanguages() {
  console.log('Перед axios.get')
  try {
    isLoading.value = true
    const response = await api.get(`/i18n/translated-languages`)
    console.log('После axios.get', response)
    const data = response.data

    if (data.status === 200) {
      // Фильтруем языки, оставляя только те, у которых есть хотя бы один перевод
      const languagesWithTranslations = data.data.languages.filter(lang => {
        //return lang.has_translations // Предполагаем, что бэкенд возвращает это поле
        return lang.code === 'en' || lang.show_in_dialog === 1
      })

      translatedLanguages.value = languagesWithTranslations.map(lang => ({
        ...lang,
        nativeName: lang.native_name
      }))
    }
  } catch (error) {
    console.error('Failed to load translated languages:', error)
    toast.error(t('UI.language.error.loading'))
  } finally {
    isLoading.value = false
  }
}

// Загрузка доступных языков
async function loadAvailableLanguages() {
  try {
    isLoading.value = true
    const response = await api.get('/i18n/available-languages')
    const data = response.data
    console.log('data.data.languages', data.data.languages)
    if (data.status === 200) {
      availableLanguages.value = data.data.languages.map(lang => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.native_name,
        flag: lang.flag_icon
      }))
    }
  } catch (error) {
    console.error('Failed to load available languages:', error)
    toast.error(t('UI.language.error.loading'))
  } finally {
    isLoading.value = false
  }
}

// Загружаем переведенные языки при монтировании компонента
onMounted(async () => {
  console.log('LanguageSwitcher mounted')
  await loadTranslatedLanguages()
})

// Загружаем доступные языки при открытии диалога
watch(() => showAddLanguageDialog.value, (newValue) => {
  if (newValue) {
    loadAvailableLanguages()
  }
})

const currentLanguage = computed(() =>
  translatedLanguages.value.find(lang => lang.code === languageStore.currentLanguage)
)

const currentLanguageName = computed(() => {
  const lang = translatedLanguages.value.find(l => l.code === languageStore.currentLanguage)
  return lang?.nativeName || 'English'
})

const currentLanguageCode = computed(() => {
  return languageStore.currentLanguage
})

const handleLanguageSelect = async (lang) => {
  try {
    await languageStore.setLanguage(lang)
    isOpen.value = false
  } catch (error) {
    console.error('Failed to switch language:', error)
    toast.error(t('UI.language.error.switching'))
  }
}

const handleAddLanguage = async (lang) => {
  try {
    isTranslating.value = true
    await languageStore.addLanguage(lang.code)
    showAddLanguageDialog.value = false
    await loadTranslatedLanguages()
    toast.success(t('UI.language.success.added'))
  } catch (error) {
    console.error('Failed to add language:', error)
    toast.error($t('UI.language.error.adding'))
  } finally {
    isTranslating.value = false
  }
}

const filteredLanguages = computed(() =>
  availableLanguages.value.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// Добавляем computed свойство для сортировки языков
const sortedTranslatedLanguages = computed(() => {
  const languages = [...translatedLanguages.value]

  // Находим английский язык
  const english = languages.find(lang => lang.code === 'en')

  // Фильтруем остальные языки
  const otherLanguages = languages.filter(lang => lang.code !== 'en')

  // Сортируем остальные языки по английскому названию
  otherLanguages.sort((a, b) => a.name.localeCompare(b.name))

  // Возвращаем массив с английским в начале
  return english ? [english, ...otherLanguages] : otherLanguages
})
</script>
