<template>
  <div class="photo-uploader">
    <div
      class="upload-area"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
      <div class="upload-content">
        <i class="fas fa-cloud-upload-alt text-4xl mb-2"></i>
        <p class="text-sm">{{ t('photoUploader.dragOrClick') }}</p>
        <p class="text-xs text-gray-500">{{ t('photoUploader.supportedFormats') }}</p>
      </div>
    </div>

    <div v-if="previewUrl" class="preview-container">
      <img :src="previewUrl" alt="Preview" class="preview-image" />
      <button
        class="remove-button"
        @click="removeImage"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const fileInput = ref(null)
const previewUrl = ref(null)
const error = ref(null)

const emit = defineEmits(['upload', 'remove'])

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

const validateAndProcessFile = (file) => {
  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    error.value = t('photoUploader.invalidFormat')
    return
  }

  // Проверка размера файла (максимум 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = t('photoUploader.fileTooLarge')
    return
  }

  // Создание превью
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
    error.value = null
    emit('upload', file)
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  previewUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('remove')
}
</script>

<style scoped>
.photo-uploader {
  @apply w-full max-w-md mx-auto;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer
         hover:border-primary-500 transition-colors duration-200;
}

.upload-content {
  @apply flex flex-col items-center justify-center;
}

.preview-container {
  @apply relative mt-4;
}

.preview-image {
  @apply w-full h-48 object-cover rounded-lg;
}

.remove-button {
  @apply absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
         hover:bg-red-600 transition-colors duration-200;
}

.error-message {
  @apply text-red-500 text-sm mt-2;
}

input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
