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
        <!-- Заголовок -->
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

          <!-- Прогресс перевода -->
          <div v-if="isTranslating" class="w-full mb-4">
            <div class="bg-gray-100 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Translating {{ translatingLanguage?.name || 'language' }}...</span>
                <span class="text-sm text-gray-500">{{ translationProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: translationProgress + '%' }"
                ></div>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                {{ translationMessage }}
              </div>
            </div>
          </div>

          <!-- Список доступных языков -->
          <div v-else>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search language..."
              class="mb-4 w-full px-3 py-2 border rounded"
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <button
                v-for="lang in filteredLanguages"
                :key="lang.code"
                @click="handleAddLanguage1(lang)"
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

import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useLanguageStore } from '@/stores/LanguageStore'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import api from '@/api'

const { t } = useI18n()
const languageStore = useLanguageStore()

const isOpen = ref(false)
const showAddLanguageDialog = ref(false)
const isLoading = ref(false)
const isTranslating = ref(false)
const translationProgress = ref(0)
const translationMessage = ref('')
const translatingLanguage = ref(null)
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
  try {
    isLoading.value = true
    const response = await api.get(`/i18n/translated-languages`)
    const data = response.data

    if (data.status === 200) {
      // Фильтруем языки, оставляя только те, у которых есть хотя бы один перевод
      const languagesWithTranslations = data.data.languages.filter(lang => {
        return lang.code === 'en' || lang.show_in_dialog === 1
      })

      translatedLanguages.value = languagesWithTranslations.map(lang => ({
        ...lang,
        nativeName: lang.native_name
      }))
    }
  } catch (error) {
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
    if (data.status === 200) {
      availableLanguages.value = data.data.languages.map(lang => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.native_name,
        flag: lang.flag_icon
      }))
    }
  } catch (error) {
    toast.error(t('UI.language.error.loading'))
  } finally {
    isLoading.value = false
  }
}

// Загружаем переведенные языки при монтировании компонента
onMounted(async () => {
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
    toast.error(t('UI.language.error.switching'))
  }
}

// Следим за статусом перевода
watch(
  () => languageStore.translationStatus,
  (newStatus) => {
    if (newStatus === 'completed' || newStatus === 'failed') {
      setTimeout(() => {
        isTranslating.value = false
        showAddLanguageDialog.value = false
      }, 1000)
    }
  }
)

/*
const handleAddLanguage = async (lang) => {
  try {
    isTranslating.value = true
    // Отправляем запрос без await
    languageStore.addLanguage(lang.code)

    // Сразу показываем сообщение и закрываем диалог
    toast.success('Запрос на перевод отправлен. Перевод будет готов через несколько минут')
    showAddLanguageDialog.value = false

  } finally {
    isTranslating.value = false
  }
}
*/

// Добавьте эту функцию для тестирования
const testServerConnection = async () => {
  try {
    console.log('=== ТЕСТИРУЕМ ПОДКЛЮЧЕНИЕ К СЕРВЕРУ ===')

    // Тестируем простой GET запрос
    const testResponse = await api.get('/i18n/available-languages')
    console.log('Тестовый запрос прошел успешно:', testResponse.status)

    // Тестируем POST запрос без параметров
    const testPostResponse = await api.post('/i18n/available-languages')
    console.log('Тестовый POST запрос прошел успешно:', testPostResponse.status)

  } catch (error) {
    console.error('Ошибка тестового запроса:', error)
    console.error('Статус:', error.response?.status)
    console.error('Данные:', error.response?.data)
  }
}

const handleAddLanguage1 = async (lang) => {
  let taskId = null
  let pollInterval = null

  try {
    console.log('=== НАЧАЛО ПЕРЕВОДА ===', lang.code)

    isTranslating.value = true
    translatingLanguage.value = lang
    translationProgress.value = 0
    translationMessage.value = 'Starting translation...'

    // Запускаем перевод
    console.log('Отправляем запрос на перевод...')
    console.log('URL:', `/i18n/translate-language-1/${lang.code}`)

    // Используем GET запрос БЕЗ таймаута
    let response
    try {
      console.log('=== ПЕРЕД API ЗАПРОСОМ ===')
      console.log('Время начала запроса:', new Date().toISOString())

      console.log('=== ОТПРАВЛЯЕМ ЗАПРОС ===')
      response = await api.get(`/i18n/translate-language-1/${lang.code}`)
      console.log('=== ЗАПРОС ЗАВЕРШЕН ===')

      console.log('=== ПОСЛЕ API ЗАПРОСА ===')
      console.log('Время получения ответа:', new Date().toISOString())
      console.log('Ответ получен:', response)
      console.log('Ответ data:', response.data)
    } catch (apiError) {
      console.error('=== ОШИБКА API ЗАПРОСА ===')
      console.error('Время ошибки:', new Date().toISOString())
      console.error('Ошибка:', apiError)
      console.error('Статус:', apiError.response?.status)
      console.error('Данные ответа:', apiError.response?.data)
      console.error('Сообщение:', apiError.message)

      throw apiError
    }

    // Проверяем структуру ответа
    if (!response.data || !response.data.data || !response.data.data.taskId) {
      console.error('=== НЕПРАВИЛЬНАЯ СТРУКТУРА ОТВЕТА ===')
      console.error('Полный ответ:', response)
      throw new Error('Неправильная структура ответа от сервера')
    }

    taskId = response.data.data.taskId
    console.log('Получили taskId:', taskId)

    console.log('=== ЗАПУСКАЕМ POLLING ===')

    // Polling
    pollInterval = setInterval(async () => {
      try {
        console.log('Проверяем статус задачи:', taskId)
        const statusResp = await api.get(`/i18n/task-status/${taskId}`)
        console.log('Ответ статуса получен:', statusResp)

        const taskData = statusResp.data.data
        console.log('Статус задачи:', taskData)

        // Добавляем логирование ошибок
        if (taskData.errors && taskData.errors.length > 0) {
          console.error('=== ОШИБКИ ЗАДАЧИ ===')
          console.error('Ошибки:', taskData.errors)
          taskData.errors.forEach((error, index) => {
            console.error(`Ошибка ${index + 1}:`, error)
          })
        }

        // Рассчитываем прогресс
        if (taskData.total_strings > 0) {
          translationProgress.value = Math.round((taskData.processed_strings / taskData.total_strings) * 100)
          console.log('Прогресс обновлен:', translationProgress.value + '%')
        } else {
          translationProgress.value = 0
          console.log('Прогресс: 0% (total_strings = 0)')
        }

        translationMessage.value = `Processed ${taskData.processed_strings} of ${taskData.total_strings}`

        // Проверяем статус задачи
        if (taskData.status === 'completed' || taskData.status === 'completed_with_errors') {
          console.log('=== ПЕРЕВОД ЗАВЕРШЕН ===')
          clearInterval(pollInterval)
          translationProgress.value = 100
          translationMessage.value = 'Translation completed!'
          toast.success('Translation completed!')

          // Убираем переведенный язык из доступных
          availableLanguages.value = availableLanguages.value.filter(l => l.code !== lang.code)

          // Добавляем язык в переведенные
          const translatedLang = {
            code: lang.code,
            name: lang.name,
            nativeName: lang.nativeName,
            flag_icon: lang.flag,
            show_in_dialog: 1
          }
          translatedLanguages.value.push(translatedLang)

          setTimeout(() => {
            isTranslating.value = false
          }, 1500)
        } else if (taskData.status === 'failed') {
          console.log('=== ПЕРЕВОД ПРОВАЛЕН ===')
          console.error('Детали ошибки:', taskData.errors)
          clearInterval(pollInterval)

          // Показываем конкретную ошибку пользователю
          let errorMessage = 'Translation failed'
          if (taskData.errors && taskData.errors.length > 0) {
            errorMessage = `Translation failed: ${taskData.errors[0]}`
          }

          translationMessage.value = errorMessage
          toast.error(errorMessage)
          setTimeout(() => {
            isTranslating.value = false
          }, 1500)
        } else if (taskData.status === 'processing') {
          console.log('Задача все еще в процессе...')
          // Продолжаем polling
        } else {
          console.log('Неизвестный статус:', taskData.status)
        }
      } catch (err) {
        console.error('Ошибка при проверке статуса:', err)
        console.error('Детали ошибки:', err.response?.data)
        clearInterval(pollInterval)
        translationMessage.value = 'Error checking status'
        toast.error('Error checking status')
        showAddLanguageDialog.value = false
      }
    }, 2000)

    console.log('=== POLLING ЗАПУЩЕН ===')

  } catch (error) {
    console.error('=== ОБЩАЯ ОШИБКА ПЕРЕВОДА ===')
    console.error('Ошибка при запуске перевода:', error)
    console.error('Ошибка response:', error.response)
    console.error('Ошибка message:', error.message)
    console.error('Ошибка status:', error.response?.status)
    console.error('Ошибка data:', error.response?.data)

    // Очищаем интервал если он был создан
    if (pollInterval) {
      clearInterval(pollInterval)
    }

    isTranslating.value = false
    translationMessage.value = 'Error starting translation'
    toast.error('Error starting translation')
    translatingLanguage.value = null
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

// Добавляем вычисляемое свойство для определения ширины прогресс-бара
const progressWidth = computed(() => {
  if (languageStore.translationStatus === 'processing') {
    return `${languageStore.translationProgress}%`
  }
  return '0%'
})

async function addLanguage(langCode) {
  try {
    console.log('Отправляем запрос на:', `/i18n/translate-language/${langCode}`)
    const response = await api.post(`/i18n/translate-language/${langCode}`)
    console.log('Получили ответ:', response.data)
    return true
  } catch (error) {
    console.error('Ошибка запроса:', error.response || error)
    throw error
  }
}

</script>
