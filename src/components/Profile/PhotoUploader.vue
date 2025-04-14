<template>
  <div class="photo-uploader">
    <!-- Предпросмотр изображения -->
    <div v-if="previewUrl" class="preview-container">
      <img :src="previewUrl" alt="Preview" class="preview-image" />
      <div class="preview-actions">
        <button @click="handleRemove" class="remove-button">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- Загрузка нового изображения -->
    <div v-else class="upload-container">
      <label class="upload-label">
        <input
          type="file"
          accept="image/*"
          @change="handleFileChange"
          :disabled="disabled"
          class="hidden"
        />
        <div class="upload-content">
          <i class="fas fa-cloud-upload-alt"></i>
          <span>{{ t('photoUploader.upload') }}</span>
        </div>
      </label>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="isUploading" class="uploading-overlay">
      <div class="spinner"></div>
      <span>{{ t('photoUploader.uploading') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upload', 'remove'])

const previewUrl = ref(null)
const isUploading = ref(false)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Создаем URL для предпросмотра
    previewUrl.value = URL.createObjectURL(file)
    emit('upload', file)
  }
}

const handleRemove = () => {
  previewUrl.value = null
  emit('remove')
}
</script>

<style scoped>
.photo-uploader {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.remove-button {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.remove-button i {
  color: white;
  font-size: 1rem;
}

.upload-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.upload-label {
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #6b7280;
}

.upload-content i {
  font-size: 2rem;
}

.uploading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
