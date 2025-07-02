<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
      <!-- Заголовок -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <Icon icon="mdi:email-edit" class="w-6 h-6 text-purple-600" />
          Email Template Manager
        </h2>
        <div class="flex items-center gap-3">
          <!-- Translate Template Button -->
          <button
            @click="handleTranslateTemplate"
            class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors"
            title="Translate Template"
          >
            <Icon icon="mdi:translate" class="w-4 h-4" />
            Translate Template
          </button>
          <!-- Translate Layout Button -->
          <button
            @click="handleTranslateLayout"
            class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center gap-2 transition-colors"
            title="Translate Layout"
          >
            <Icon icon="mdi:translate-variant" class="w-4 h-4" />
            Translate Layout
          </button>
          <!-- Close Button -->
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Основное содержимое -->
      <div class="flex-1 overflow-hidden flex">
        <!-- Левая панель - список шаблонов -->
        <div class="w-1/3 border-r bg-gray-50 flex flex-col">
          <!-- Поиск и кнопка добавления -->
          <div class="p-4 border-b bg-white">
            <div class="flex gap-2 mb-2">
              <input
                v-model="emailTemplateStore.searchQuery"
                type="text"
                :placeholder="t('UI.emailTemplateManager.search', 'Search templates...')"
                class="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <button
                @click="handleAddTemplate"
                class="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                :title="t('UI.emailTemplateManager.addTemplate', 'Add Template')"
              >
                <Icon icon="mdi:plus" class="w-4 h-4" />
              </button>
            </div>
            <!-- Language Switcher -->
            <div class="flex gap-2 items-center">
              <label class="text-xs text-gray-500">{{ t('UI.language.select', 'Language') }}:</label>
              <select
                v-model="selectedLocale"
                class="px-2 py-1 border rounded text-xs"
              >
                <option value="">{{ t('UI.common.all', 'All') }}</option>
                <option
                  v-for="locale in localeOptions"
                  :key="locale.code"
                  :value="locale.code"
                >
                  {{ locale.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Список шаблонов -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="emailTemplateStore.isLoading" class="p-4 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p class="text-sm text-gray-500 mt-2">{{ t('UI.common.loading', 'Loading...') }}</p>
            </div>

            <div v-else-if="filteredTemplates.length === 0" class="p-4 text-center text-gray-500">
              {{ t('UI.emailTemplateManager.noTemplates', 'No templates found') }}
            </div>

            <div v-else>
              <button
                v-for="template in filteredTemplates"
                :key="template.template_id"
                @click="emailTemplateStore.selectTemplate(template)"
                class="w-full p-4 text-left hover:bg-white border-b transition-colors"
                :class="{ 'bg-white border-l-4 border-l-purple-600': emailTemplateStore.selectedTemplate?.template_id === template.template_id }"
              >
                <div class="font-medium text-sm">{{ template.code }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ template.subject || 'No subject' }}</div>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded">{{ template.name }}</span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{{ template.locale }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Правая панель - структура письма -->
        <div class="flex-1 flex flex-col">
          <!-- Когда ничего не выбрано -->
          <div v-if="!emailTemplateStore.selectedTemplate && !isCreatingNew" class="flex-1 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Icon icon="mdi:email-outline" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>{{ t('UI.emailTemplateManager.selectTemplate', 'Select a template to view') }}</p>
            </div>
          </div>

          <!-- Когда выбран шаблон ИЛИ создается новый -->
          <div v-else class="flex-1 flex flex-col">
            <!-- Информация о шаблоне -->
            <div class="p-4 border-b bg-gray-50">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium">
                    {{ emailTemplateStore.selectedTemplate?.code || 'New Template' }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    Layout: {{ emailTemplateStore.selectedTemplate?.name || 'Default' }}
                    ({{ emailTemplateStore.selectedTemplate?.locale || 'en' }})
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="handleSave"
                    :disabled="emailTemplateStore.isLoading"
                    class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                    :title="t('UI.emailTemplateManager.save', 'Save')"
                  >
                    <Icon v-if="emailTemplateStore.isLoading" icon="mdi:loading" class="w-4 h-4 animate-spin" />
                    <Icon v-else icon="mdi:content-save" class="w-4 h-4" />
                  </button>
                  <button
                    @click="showPreview = true"
                    class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    :title="t('UI.emailTemplateManager.preview', 'Preview')"
                  >
                    <Icon icon="mdi:eye" class="w-4 h-4" />
                  </button>
                  <button
                    v-if="emailTemplateStore.selectedTemplate"
                    @click="handleDeleteTemplate"
                    class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    :title="t('UI.emailTemplateManager.deleteTemplate', 'Delete Template')"
                  >
                    <Icon icon="mdi:delete" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Структура письма - без Layout ID -->
            <div class="flex-1 overflow-y-auto p-4">
              <div class="border-b flex gap-2 mb-4">
                <button
                  :class="activeTab === 'main' ? 'border-b-2 border-purple-600 text-purple-700 font-semibold' : 'text-gray-500'"
                  class="px-4 py-2 focus:outline-none"
                  @click="activeTab = 'main'"
                >
                  Template
                </button>
                <button
                  :class="activeTab === 'testdata' ? 'border-b-2 border-purple-600 text-purple-700 font-semibold' : 'text-gray-500'"
                  class="px-4 py-2 focus:outline-none"
                  @click="activeTab = 'testdata'"
                >
                  Test Data (JSON)
                </button>
              </div>

              <div v-if="activeTab === 'main'">
                <div class="space-y-6">
                  <!-- Code -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Code
                      </label>
                    </div>
                    <input
                      v-model="editableCode"
                      type="text"
                      class="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="e.g. welcome_email"
                    />
                  </div>

                  <!-- Subject -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                    </div>
                    <textarea
                      v-model="editableSubject"
                      class="w-full h-16 px-3 py-2 border rounded-md text-sm resize-none overflow-y-auto"
                      placeholder="Email subject..."
                    ></textarea>
                  </div>

                  <!-- Body -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Body HTML
                      </label>
                    </div>
                    <textarea
                      v-model="editableBody"
                      class="w-full h-80 px-3 py-2 border rounded-md text-xs font-mono resize-none overflow-y-auto"
                      placeholder="Body HTML code..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div v-else>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Test Data (JSON)
                </label>
                <textarea
                  v-model="editableTestData"
                  rows="16"
                  class="w-full font-mono border rounded p-2 resize-y"
                  style="min-height: 120px; max-height: 400px;"
                  placeholder='{"Sender_Phone": "+1...", "now": "2024"}'
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ошибка -->
      <div v-if="errorMessage" class="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 font-semibold">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
    >
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <div class="flex-1">
            <h3 class="text-lg font-semibold">Email Preview</h3>
            <!-- Subject под заголовком -->
            <p class="text-sm text-gray-600 mt-1">
              <strong>Subject:</strong> {{ replaceVariables(editableSubject, parsedTestData) || 'No subject' }}
            </p>
          </div>

          <!-- Свитчер режимов -->
          <div class="flex items-center gap-4 mx-4">
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="previewWithVariables"
                type="checkbox"
                class="rounded"
              />
              <span>Show with sample data</span>
            </label>
          </div>

          <button @click="showPreview = false" class="text-gray-500 hover:text-gray-700">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <div class="border rounded-lg overflow-hidden">
            <div v-html="getPreviewHtml()" class="bg-white email-preview"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useEmailTemplateStore } from '@/stores/EmailTemplateStore'
import api from '@/api'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const emailTemplateStore = useEmailTemplateStore()

// Флаги состояния
const isCreatingNew = ref(false)
const showPreview = ref(false)
const previewWithVariables = ref(false)
const activeTab = ref('main') // 'main' или 'testdata'

// Редактируемые поля
const editableTemplateId = ref(emailTemplateStore.selectedTemplate?.template_id || '')
const editableCode = ref(emailTemplateStore.selectedTemplate?.code || '')
const editableSubject = ref(emailTemplateStore.selectedTemplate?.subject || '')
const editableBody = ref(emailTemplateStore.selectedTemplate?.body_html || '')
const editableLayoutId = ref(emailTemplateStore.selectedTemplate?.layout_id || '')
const editableLocale = ref(emailTemplateStore.selectedTemplate?.locale || '')
const editableTestData = ref('{}')

// Примерные данные для подстановки переменных
const sampleData = {
  Sender_Phone: '+1 (555) 123-4567',
  Sender_Email: 'support@petsbook.ca',
  UnsubscribeUrl: 'https://petsbook.ca/unsubscribe/xyz789',
  now: new Date().getFullYear().toString()
  // ... другие переменные, если нужно ...
}

const parsedTestData = computed(() => {
  try {
    return JSON.parse(editableTestData.value)
  } catch {
    return {} // или sampleData, если хотите fallback
  }
})

// Функция замены переменных
function replaceVariables(html, data) {
  if (!html) return ''
  let result = html.replace(/{%[^%]*%}/g, '')
  result = result.replace(/{{\s*([\w_]+)\s*}}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match
  })
  return result
}

// Генерация HTML для превью
const getPreviewHtml = () => {
  const template = emailTemplateStore.selectedTemplate
  if (!template) return ''
  //console.log('RAW BODY:', editableBody.value)
  let headerHtml = template.header_html || ''
  let bodyHtml = editableBody.value || template.body_html || ''
  let footerHtml = template.footer_html || ''

  if (previewWithVariables.value) {
    // Используем именно parsedTestData!
    headerHtml = replaceVariables(headerHtml, parsedTestData.value)
    bodyHtml = replaceVariables(bodyHtml, parsedTestData.value)
    footerHtml = replaceVariables(footerHtml, parsedTestData.value)
  }
  console.log('BBBBBBODY:', bodyHtml)
  const html = `${headerHtml}${bodyHtml}${footerHtml}`
  //console.log(html);
  return html
}



// Синхронизация с выбранным шаблоном
watch(() => emailTemplateStore.selectedTemplate, (newTemplate) => {
  if (newTemplate) {
    editableTemplateId.value = newTemplate.template_id || ''
    editableCode.value = newTemplate.code || ''
    editableSubject.value = newTemplate.subject || ''
    editableBody.value = newTemplate.body_html || ''
    editableLayoutId.value = newTemplate.layout_id || ''
    editableLocale.value = newTemplate.locale || ''
    editableTestData.value = newTemplate.test_data_json || '{}'
  } else {
    editableTemplateId.value = ''
    editableCode.value = ''
    editableSubject.value = ''
    editableBody.value = ''
    editableLayoutId.value = ''
    editableLocale.value = ''
    editableTestData.value = '{}'
  }
}, { immediate: true })

// Простая функция уведомлений
const showNotification = (type, message) => {
  if (type === 'error') {
    alert('Error: ' + message)
  } else {
    alert('Success: ' + message)
  }
}

const errorMessage = ref('')

const handleSave = async () => {
  try {
    await emailTemplateStore.saveTemplate({
      template_id: editableTemplateId.value,
      code: editableCode.value,
      subject: editableSubject.value,
      body_html: editableBody.value,
      layout_id: editableLayoutId.value,
      locale: editableLocale.value,
      test_data_json: editableTestData.value
    })
    alert('Template saved successfully')
  } catch (error) {
    if (error?.response?.data?.error) {
      alert(error.response.data.error)
    } else {
      alert(error.message || 'Unknown error')
    }
  }
}

const handleAddTemplate = () => {
  console.log('Add template clicked')
  isCreatingNew.value = true
  emailTemplateStore.clearSelection()
  editableCode.value = ''
  editableSubject.value = ''
  editableBody.value = ''
  editableLayoutId.value = ''
  editableLocale.value = ''
}

const handleDeleteTemplate = () => {
  console.log('Delete template clicked')
  if (emailTemplateStore.selectedTemplate) {
    console.log('Deleting template:', emailTemplateStore.selectedTemplate.code)
  }
}

// Загрузка данных при открытии
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    emailTemplateStore.loadTemplates()
  }
})

onMounted(() => {
  if (props.isVisible) {
    emailTemplateStore.loadTemplates()
  }
})

const testDataJson = ref('')

const saveTestData = () => {
  // Implementation of saveTestData function
}

async function handleTranslateTemplate() {
  try {
    await emailTemplateStore.translateTemplate()
    alert('Template translation started')
  } catch (e) {
    alert('Error while translating template: ' + (e?.message || e))
  }
}

async function handleTranslateLayout() {
  try {
    await emailTemplateStore.translateLayout()
    alert('Layout translation started')
  } catch (e) {
    alert('Error while translating layout: ' + (e?.message || e))
  }
}

// Новый фильтр по языку
const selectedLocale = ref('')

// Список языков с сервера
const availableLanguages = ref([])

// Загрузка языков с сервера
async function loadAvailableLanguages() {
  try {
    const response = await api.get('/i18n/translated-languages')
    const data = response.data
    if (data.status === 200) {
      availableLanguages.value = data.data.languages.map(lang => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.native_name,
        flag: lang.flag_icon
      }))
    }
  } catch (e) {
    // ignore error for now
  }
}

// Получаем список всех уникальных языков из шаблонов
const usedLocales = computed(() => {
  // Если шаблоны еще не загружены, возвращаем пустой массив
  if (!emailTemplateStore.templates.length) return []
  // Берем все уникальные коды языков из шаблонов
  return Array.from(new Set(emailTemplateStore.templates.map(t => t.locale).filter(Boolean)))
})

// Для отображения: [{ code, label }]
const localeOptions = computed(() => {
  // Просто все языки с сервера, label = name
  return availableLanguages.value.map(lang => ({
    code: lang.code,
    label: lang.name
  }))
})

// Загрузка языков при открытии диалога
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    emailTemplateStore.loadTemplates()
    loadAvailableLanguages()
  }
})

onMounted(() => {
  if (props.isVisible) {
    emailTemplateStore.loadTemplates()
    loadAvailableLanguages()
  }
})

// Фильтруем шаблоны по выбранному языку и поисковому запросу
const filteredTemplates = computed(() => {
  let templates = emailTemplateStore.filteredTemplates
  if (selectedLocale.value) {
    templates = templates.filter(t => t.locale === selectedLocale.value)
  }
  return templates
})
</script>

<style>
.email-preview h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}
.email-preview h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
}
.email-preview h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
}
.email-preview ul {
  list-style: disc inside;
  margin: 1em 0 1.5em 1.5em;
  padding: 0;
}
.email-preview li {
  margin: 0.2em 0;
}
.email-preview a {
  color: #1976d2;
  text-decoration: underline;
  word-break: break-all;
}
.email-preview p {
  margin: 0.5em 0;
}
</style>




