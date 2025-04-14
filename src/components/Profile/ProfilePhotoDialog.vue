<template>
  <div v-if="isOwnProfile">
    <!-- Диалог загрузки аватара -->
    <button
      @click="showAvatarDialog = true"
      class="avatar-upload-button"
    >
      <i class="fas fa-camera"></i>
    </button>

    <Dialog
      v-model="showAvatarDialog"
      :title="t('photoUploader.uploadAvatar')"
      @close="showAvatarDialog = false"
    >
      <PhotoUploader
        @upload="handleAvatarUpload"
        @remove="handleAvatarRemove"
        :disabled="isUploading"
      />
    </Dialog>

    <!-- Диалог загрузки фонового фото -->
    <button
      @click="showCoverDialog = true"
      class="cover-upload-button"
    >
      <i class="fas fa-camera"></i>
    </button>

    <Dialog
      v-model="showCoverDialog"
      :title="t('photoUploader.uploadCover')"
      @close="showCoverDialog = false"
    >
      <PhotoUploader
        @upload="handleCoverPhotoUpload"
        @remove="handleCoverPhotoRemove"
        :disabled="isUploading"
      />
    </Dialog>

    <!-- Индикатор загрузки -->
    <div v-if="isUploading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/UserStore'
import { PhotoService } from '@/services/PhotoService'
import { optimizeAvatar, optimizeCoverPhoto } from '@/utils/imageOptimizer'
import PhotoUploader from '@/components/ui/PhotoUploader.vue'
import Dialog from '@/components/ui/Dialog.vue'

const props = defineProps({
  isOwnProfile: {
    type: Boolean,
    required: true
  }
})

const { t } = useI18n()
const userStore = useUserStore()
const isUploading = ref(false)
const showAvatarDialog = ref(false)
const showCoverDialog = ref(false)

const handleAvatarUpload = async (file) => {
  try {
    isUploading.value = true
    const optimizedFile = await optimizeAvatar(file)
    const response = await PhotoService.uploadPhoto(optimizedFile, 'avatar')
    userStore.updateUserData({ avatar: response.url })
    showAvatarDialog.value = false
  } catch (error) {
    console.error('Error uploading avatar:', error)
  } finally {
    isUploading.value = false
  }
}

const handleCoverPhotoUpload = async (file) => {
  try {
    isUploading.value = true
    const optimizedFile = await optimizeCoverPhoto(file)
    const response = await PhotoService.uploadPhoto(optimizedFile, 'cover')
    userStore.updateUserData({ coverPhoto: response.url })
    showCoverDialog.value = false
  } catch (error) {
    console.error('Error uploading cover photo:', error)
  } finally {
    isUploading.value = false
  }
}

const handleAvatarRemove = async () => {
  try {
    isUploading.value = true
    await PhotoService.deletePhoto('avatar')
    userStore.updateUserData({ avatar: null })
    showAvatarDialog.value = false
  } catch (error) {
    console.error('Error removing avatar:', error)
  } finally {
    isUploading.value = false
  }
}

const handleCoverPhotoRemove = async () => {
  try {
    isUploading.value = true
    await PhotoService.deletePhoto('cover')
    userStore.updateUserData({ coverPhoto: null })
    showCoverDialog.value = false
  } catch (error) {
    console.error('Error removing cover photo:', error)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.avatar-upload-button {
  @apply absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md
         hover:bg-gray-100 transition-colors duration-200;
}

.cover-upload-button {
  @apply absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md
         hover:bg-gray-100 transition-colors duration-200;
}

.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin;
}
</style>
