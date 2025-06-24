<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
      <!-- Заголовок -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <Icon icon="mdi:email-edit" class="w-6 h-6 text-purple-600" />
          {{ t('UI.emailTemplateManager.title', 'Email Template Manager') }}
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Основное содержимое -->
      <div class="flex-1 overflow-hidden flex">
        <!-- Левая панель - список шаблонов -->
        <div class="w-1/3 border-r bg-gray-50 flex flex-col">
          <!-- Поиск и кнопка добавления -->
          <div class="p-4 border-b bg-white">
            <div class="flex gap-2">
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
          </div>

          <!-- Список шаблонов -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="emailTemplateStore.isLoading" class="p-4 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p class="text-sm text-gray-500 mt-2">{{ t('UI.common.loading', 'Loading...') }}</p>
            </div>

            <div v-else-if="emailTemplateStore.filteredTemplates.length === 0" class="p-4 text-center text-gray-500">
              {{ t('UI.emailTemplateManager.noTemplates', 'No templates found') }}
            </div>

            <div v-else>
              <button
                v-for="template in emailTemplateStore.filteredTemplates"
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

            <!-- Структура письма -->
            <div class="flex-1 overflow-y-auto p-4">
              <div class="space-y-6">
                <!-- Subject -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      {{ t('UI.emailTemplateManager.subject', 'Subject') }}
                    </label>
                  </div>
                  <textarea
                    :value="emailTemplateStore.selectedTemplate?.subject || ''"
                    class="w-full h-16 px-3 py-2 border rounded-md text-sm resize-none overflow-y-auto"
                    placeholder="Email subject..."
                  ></textarea>
                </div>

                <!-- Header -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Header
                    </label>
                    <button class="text-xs text-purple-600 hover:text-purple-700">
                      <Icon icon="mdi:pencil" class="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    :value="emailTemplateStore.selectedTemplate?.header_html || ''"
                    class="w-full h-32 px-3 py-2 border rounded-md text-xs font-mono resize-none overflow-y-auto"
                    placeholder="Header HTML code..."
                  ></textarea>
                </div>

                <!-- Body -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Body
                    </label>
                    <button class="text-xs text-purple-600 hover:text-purple-700">
                      <Icon icon="mdi:pencil" class="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    :value="emailTemplateStore.selectedTemplate?.body_html || ''"
                    class="w-full h-48 px-3 py-2 border rounded-md text-xs font-mono resize-none overflow-y-auto"
                    placeholder="Body HTML code..."
                  ></textarea>
                </div>

                <!-- Footer -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Footer
                    </label>
                    <button class="text-xs text-purple-600 hover:text-purple-700">
                      <Icon icon="mdi:pencil" class="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    :value="emailTemplateStore.selectedTemplate?.footer_html || ''"
                    class="w-full h-24 px-3 py-2 border rounded-md text-xs font-mono resize-none overflow-y-auto"
                    placeholder="Footer HTML code..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
    >
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold">Email Preview</h3>
          <button @click="showPreview = false" class="text-gray-500 hover:text-gray-700">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <div class="border rounded-lg overflow-hidden">
            <div v-html="getFullEmailHtml()" class="bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useEmailTemplateStore } from '@/stores/EmailTemplateStore'

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

// Генерация полного HTML письма для превью
const getFullEmailHtml = () => {
  const template = emailTemplateStore.selectedTemplate
  if (!template) return ''

  return `
    ${template.header_html || ''}
    ${template.body_html || ''}
    ${template.footer_html || ''}
  `
}

// Обработчики кнопок
const handleAddTemplate = () => {
  console.log('Add template clicked')
  isCreatingNew.value = true
  emailTemplateStore.clearSelection()
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
</script>