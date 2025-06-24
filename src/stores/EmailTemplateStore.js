import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useEmailTemplateStore = defineStore('emailTemplate', () => {
  // Состояние
  const templates = ref([])
  const availableLanguages = ref([])
  const selectedTemplate = ref(null)
  const editingTemplate = ref({})
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const isCreating = ref(false)
  const error = ref(null)

  // Фильтры и поиск
  const searchQuery = ref('')
  const selectedLanguageFilter = ref('')

  // Вычисляемые свойства
  const filteredTemplates = computed(() => {
    if (!searchQuery.value) return templates.value

    const query = searchQuery.value.toLowerCase()
    return templates.value.filter(
      (template) =>
        template.code.toLowerCase().includes(query) ||
        template.subject?.toLowerCase().includes(query),
    )
  })

  const hasChanges = computed(() => {
    if (!selectedTemplate.value || !editingTemplate.value) return false
    return JSON.stringify(editingTemplate.value) !== JSON.stringify(selectedTemplate.value)
  })

  const templatesByLanguage = computed(() => {
    const grouped = {}
    templates.value.forEach((template) => {
      if (!grouped[template.language]) {
        grouped[template.language] = []
      }
      grouped[template.language].push(template)
    })
    return grouped
  })

  // Действия
  const loadTemplates = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.get('/i18n/email-templates')

      if (response.data.status === 200) {
        templates.value = response.data.data.templates || []
        return true
      } else {
        throw new Error(response.data.message || 'Failed to load templates')
      }
    } catch (err) {
      console.error('Error loading email templates:', err)
      error.value = err.message || 'Failed to load templates'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loadLanguages = async () => {
    try {
      const response = await api.get('/i18n/translated-languages')

      if (response.data.status === 200) {
        availableLanguages.value = response.data.data.languages || []
      }
    } catch (err) {
      console.error('Error loading languages:', err)
      availableLanguages.value = []
    }
  }

  const selectTemplate = (template) => {
    selectedTemplate.value = template
    editingTemplate.value = { ...template }
  }

  const clearSelection = () => {
    selectedTemplate.value = null
  }

  const updateEditingTemplate = (field, value) => {
    editingTemplate.value[field] = value
  }

  const saveTemplate = async () => {
    if (!selectedTemplate.value || !hasChanges.value) return false

    try {
      isSaving.value = true
      error.value = null

      const response = await api.put(
        `/email-templates/${selectedTemplate.value.id}`,
        editingTemplate.value,
      )

      if (response.data.status === 200) {
        // Обновляем шаблон в списке
        const index = templates.value.findIndex((t) => t.id === selectedTemplate.value.id)
        if (index !== -1) {
          templates.value[index] = { ...editingTemplate.value }
          selectedTemplate.value = templates.value[index]
        }

        return true
      } else {
        throw new Error(response.data.message || 'Failed to save template')
      }
    } catch (err) {
      console.error('Error saving template:', err)
      error.value = err.message || 'Failed to save template'
      return false
    } finally {
      isSaving.value = false
    }
  }

  const deleteTemplate = async (templateId = null) => {
    const targetId = templateId || selectedTemplate.value?.id
    if (!targetId) return false

    try {
      isDeleting.value = true
      error.value = null

      const response = await api.delete(`/email-templates/${targetId}`)

      if (response.data.status === 200) {
        // Удаляем из списка
        templates.value = templates.value.filter((t) => t.id !== targetId)

        // Если удаляем выбранный шаблон, очищаем выбор
        if (selectedTemplate.value?.id === targetId) {
          clearSelection()
        }

        return true
      } else {
        throw new Error(response.data.message || 'Failed to delete template')
      }
    } catch (err) {
      console.error('Error deleting template:', err)
      error.value = err.message || 'Failed to delete template'
      return false
    } finally {
      isDeleting.value = false
    }
  }

  const duplicateTemplate = async (templateId, newLanguage = null) => {
    const template = templates.value.find((t) => t.id === templateId)
    if (!template) return null

    const duplicateData = {
      template_key: template.template_key,
      language: newLanguage || template.language,
      subject: template.subject,
      body: template.body,
      is_active: template.is_active,
    }

    return await createTemplate(duplicateData)
  }

  const getTemplatesByKey = (templateKey) => {
    return templates.value.filter((t) => t.template_key === templateKey)
  }

  const getTemplateByKeyAndLanguage = (templateKey, language) => {
    return templates.value.find((t) => t.template_key === templateKey && t.language === language)
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedLanguageFilter.value = ''
  }

  const resetStore = () => {
    templates.value = []
    availableLanguages.value = []
    selectedTemplate.value = null
    editingTemplate.value = {}
    error.value = null
    resetFilters()
  }

  // Инициализация
  const initialize = async () => {
    await Promise.all([loadTemplates(), loadLanguages()])
  }

  return {
    // Состояние
    templates,
    availableLanguages,
    selectedTemplate,
    editingTemplate,
    isLoading,
    isSaving,
    isDeleting,
    isCreating,
    error,

    // Фильтры
    searchQuery,
    selectedLanguageFilter,

    // Вычисляемые свойства
    filteredTemplates,
    hasChanges,
    templatesByLanguage,

    // Действия
    loadTemplates,
    loadLanguages,
    selectTemplate,
    clearSelection,
    updateEditingTemplate,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplatesByKey,
    getTemplateByKeyAndLanguage,
    resetFilters,
    resetStore,
    initialize,
  }
})
