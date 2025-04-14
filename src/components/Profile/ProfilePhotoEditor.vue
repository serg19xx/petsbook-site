<template>
  <div v-if="isOwnProfile" class="profile-photo-editor">
    <!-- Редактор фонового фото -->
    <div class="cover-photo-editor">
      <PhotoUploader
        @upload="handleCoverPhotoUpload"
        @remove="handleCoverPhotoRemove"
        :disabled="isUploading"
      />
    </div>

    <!-- Редактор аватара -->
    <div class="avatar-editor">
      <PhotoUploader
        @upload="handleAvatarUpload"
        @remove="handleAvatarRemove"
        :disabled="isUploading"
      />
    </div>

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

const props = defineProps({
  isOwnProfile: {
    type: Boolean,
    required: true
  }
})

const { t } = useI18n()
const userStore = useUserStore()
const isUploading = ref(false)

const handleAvatarUpload = async (file) => {
  try {
    isUploading.value = true
    const optimizedFile = await optimizeAvatar(file)
    const response = await PhotoService.uploadPhoto(optimizedFile, 'avatar')
    userStore.updateUserData({ avatar: response.url })
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
  } catch (error) {
    console.error('Error removing cover photo:', error)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.profile-photo-editor {
  @apply absolute inset-0;
}

.cover-photo-editor {
  @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50;
}

.avatar-editor {
  @apply absolute -bottom-16 left-4 w-32 h-32 rounded-full overflow-hidden;
}

.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin;
}
</style>
