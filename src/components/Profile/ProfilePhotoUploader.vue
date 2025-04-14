<template>
  <div class="profile-photo-uploader">
    <!-- Фоновое фото -->
    <div class="cover-photo-container">
      <div class="cover-photo-wrapper">
        <img
          v-if="coverPhotoUrl"
          :src="coverPhotoUrl"
          alt="Cover photo"
          class="cover-photo"
        />
        <div v-else class="cover-photo-placeholder">
          <i class="fas fa-image text-4xl text-gray-400"></i>
        </div>
        <div class="cover-photo-overlay">
          <PhotoUploader
            @upload="handleCoverPhotoUpload"
            @remove="handleCoverPhotoRemove"
            :disabled="isUploading"
          />
        </div>
      </div>
    </div>

    <!-- Аватар -->
    <div class="avatar-container">
      <div class="avatar-wrapper">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Avatar"
          class="avatar"
        />
        <div v-else class="avatar-placeholder">
          <i class="fas fa-user text-4xl text-gray-400"></i>
        </div>
        <div class="avatar-overlay">
          <PhotoUploader
            @upload="handleAvatarUpload"
            @remove="handleAvatarRemove"
            :disabled="isUploading"
          />
        </div>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="isUploading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/UserStore'
import { PhotoService } from '@/services/PhotoService'
import PhotoUploader from '@/components/ui/PhotoUploader.vue'
import { optimizeAvatar, optimizeCoverPhoto } from '@/utils/imageOptimizer'

const { t } = useI18n()
const userStore = useUserStore()

const avatarUrl = ref(null)
const coverPhotoUrl = ref(null)
const isUploading = ref(false)

onMounted(async () => {
  try {
    const photos = await PhotoService.getPhotos(userStore.userData.id)
    if (photos.avatar) {
      avatarUrl.value = photos.avatar
    }
    if (photos.cover) {
      coverPhotoUrl.value = photos.cover
    }
  } catch (error) {
    console.error('Error loading profile photos:', error)
  }
})

const handleAvatarUpload = async (file) => {
  try {
    isUploading.value = true
    const optimizedFile = await optimizeAvatar(file)
    const response = await PhotoService.uploadPhoto(optimizedFile, 'avatar')
    avatarUrl.value = response.url
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
    coverPhotoUrl.value = response.url
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
    avatarUrl.value = null
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
    coverPhotoUrl.value = null
    userStore.updateUserData({ coverPhoto: null })
  } catch (error) {
    console.error('Error removing cover photo:', error)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.profile-photo-uploader {
  @apply relative;
}

.cover-photo-container {
  @apply relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden;
}

.cover-photo-wrapper {
  @apply relative w-full h-full;
}

.cover-photo {
  @apply w-full h-full object-cover;
}

.cover-photo-placeholder {
  @apply w-full h-full flex items-center justify-center bg-gray-100;
}

.cover-photo-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50;
}

.avatar-container {
  @apply absolute -bottom-16 left-4;
}

.avatar-wrapper {
  @apply relative w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden;
}

.avatar {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full flex items-center justify-center bg-gray-100;
}

.avatar-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50;
}

.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin;
}
</style>
