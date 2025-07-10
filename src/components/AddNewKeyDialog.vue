<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg w-full max-w-md">
      <!-- Заголовок -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold">Add New Key</h2>
        <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Содержимое -->
      <div class="p-6">
        <div class="space-y-4">
          <!-- Namespace -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Namespace
            </label>
            <input
              v-model="formData.namespace"
              type="text"
              placeholder="e.g., UI, Auth, Profile"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Key Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Key Name
            </label>
            <input
              v-model="formData.keyName"
              type="text"
              placeholder="e.g., button.save, form.email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- English Value -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              English Value
            </label>
            <textarea
              v-model="formData.englishValue"
              rows="3"
              placeholder="Enter the English text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="2"
              placeholder="Optional description of this key"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeDialog"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="!isFormValid || isSubmitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Adding...' : 'Add Key' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//      "apiKey": "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",
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue3-toastify'
import api from '@/api'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  keyId: {
    type: Number,
    default: 0
  },
  keyData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'key-added', 'key-updated'])

const formData = ref({
  namespace: '',
  keyName: '',
  englishValue: '',
  description: ''
})

const isSubmitting = ref(false)
const originalValue = ref('')

const isFormValid = computed(() => {
  return formData.value.namespace.trim() &&
         formData.value.keyName.trim() &&
         formData.value.englishValue.trim()
})

watch(() => props.isVisible, (val) => {
  if (val && props.keyData) {
    // Заполняем форму данными для редактирования
    formData.value = {
      namespace: props.keyData.namespace || '',
      keyName: props.keyData.key_name || '',
      englishValue: props.keyData.english_value || props.keyData.value || '',
      description: props.keyData.description || ''
    }
    // Сохраняем оригинальное значение для сравнения
    originalValue.value = formData.value.englishValue
  } else if (val && !props.keyData) {
    // Очищаем форму для добавления
    resetForm()
    originalValue.value = ''
  }
})

function closeDialog() {
  emit('close')
  resetForm()
}

function resetForm() {
  formData.value = {
    namespace: '',
    keyName: '',
    englishValue: '',
    description: ''
  }
  isSubmitting.value = false
}

async function handleSubmit() {
  if (!isFormValid.value) return

  try {
    isSubmitting.value = true

    const payload = {
      key_name: formData.value.keyName,
      namespace: formData.value.namespace,
      description: formData.value.description,
      value: formData.value.englishValue,
      original_value: originalValue.value // Добавляем оригинальное значение
    }

    let response
    if (props.keyId > 0) {
      // Обновление
      payload.key_id = props.keyId
              response = await api.post('/api/i18n/update-translation-key', payload)
      emit('key-updated', response.data.data)
    } else {
      // Добавление
              response = await api.post('/api/i18n/add-translation-key', payload)
      emit('key-added', response.data.data)
    }

    if (response.data.status === 200) {
      toast.success(props.keyId > 0 ? 'Key updated successfully!' : 'Key added successfully!')
      closeDialog()
    } else {
      throw new Error(response.data.message || 'Failed to save key')
    }

  } catch (error) {
    console.error('Error saving key:', error)
    toast.error(error.response?.data?.message || 'Failed to save key')
  } finally {
    isSubmitting.value = false
  }
}
</script>
