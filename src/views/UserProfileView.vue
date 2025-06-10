<template>
  <MainLayout>
    <!-- Left Sidebar Content -->
    <template #left-sidebar>


    </template>

    <!-- Main Content -->
    <template #default>
      <div class="space-y-6">
        <div class="user-profile-view">
          <div class="profile-content">
           <UserProfileCard :isOwnProfile="isOwnProfile" />
          </div>
        </div>

        <!-- Role Badge -->
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
             :class="{
               'bg-blue-100 text-blue-800': userRole === 'petowner',
               'bg-purple-100 text-purple-800': userRole === 'business',
               'bg-green-100 text-green-800': userRole === 'producer',
               'bg-gray-100 text-gray-800': userRole === 'user'
             }">
          <Icon :icon="getRoleIcon" class="w-4 h-4 mr-2" />
          {{ $t(`UI.profileview.role.${userRole}`) }}
        </div>

        <!-- Role-specific content will be rendered here through router-view -->
        <router-view></router-view>
      </div>
    </template>

    <template #right-sidebar></template>

  </MainLayout>
</template>
<!-- eslint-disable no-undef -->
 <!-- eslint-disable no-unused-vars -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useAuthStore } from '@/stores/AuthStore'
import { Icon } from '@iconify/vue'
import MainLayout from '@/layouts/MainLayout.vue'
import UserProfileCard from '@/components/Profile/UserProfileCard.vue'
import { useI18n } from 'vue-i18n'
//import PhotoUploader from '@/components/Profile/PhotoUploader.vue'
import { PhotoService } from '@/services/PhotoService'
import { optimizeAvatar, optimizeCoverPhoto } from '@/utils/imageUtils'
//import Dialog from '@/components/ui/Dialog.vue'

const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const { t } = useI18n()

// Получаем роль из store
const userRole = computed(() => userStore.userData?.role || 'user')

const getRoleIcon = computed(() => {
  const icons = {
    petowner: 'mdi:paw',
    business: 'mdi:domain',
    producer: 'mdi:movie',
    user: 'mdi:account'
  }
  return icons[userRole.value] || 'mdi:account'
})

const getRoleLabel = computed(() => {
  const labels = {
    petowner: t('roles.petowner'),
    business: t('roles.business'),
    producer: t('roles.producer'),
    user: t('roles.user')
  }
  return labels[userRole.value] || t('roles.user')
})

const isOwnProfile = computed(() => {
  const result = !route.params.id || route.params.id === userStore.userData?.id
  return result
})

// Получаем статистику из store
const profileStats = computed(() => ({
  views: userStore.userData?.stats?.views || 0,
  followers: userStore.userData?.stats?.followers || 0,
  posts: userStore.userData?.stats?.posts || 0
}))

const isActiveRoute = (path) => {
  return route.path === path
}

// Загрузка данных при монтировании компонента
onMounted(async () => {
  if (!userStore.userData) {
    try{
      await userStore.fetchUserData()
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login')
      }
    }
  }
})


//const userAvatar = computed(() => userStore.userData?.avatar)

const showAvatarDialog = ref(false)
const showCoverPhotoDialog = ref(false)
const isUploading = ref(false)

const handleAvatarUpload = async (file) => {
  try {
    isUploading.value = true
    const optimizedFile = await optimizeAvatar(file)
    const response = await PhotoService.uploadAvatar(optimizedFile)
    if (response.success) {
      userStore.updateUserData({ avatar: response.data.url })
      showAvatarDialog.value = false
      authStore.userAvatar.value = response.data.url
    }
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
    const response = await PhotoService.uploadCoverPhoto(optimizedFile)
    if (response.success) {
      userStore.updateUserData({ coverPhoto: response.data.url })
      showCoverPhotoDialog.value = false
    }
  } catch (error) {
    console.error('Error uploading cover photo:', error)
  } finally {
    isUploading.value = false
  }
}

const handleAvatarRemove = async () => {
  try {
    isUploading.value = true
    const response = await PhotoService.deleteAvatar()
    if (response.success) {
      userStore.updateUserData({ avatar: null })
      showAvatarDialog.value = false
    }
  } catch (error) {
    console.error('Error removing avatar:', error)
  } finally {
    isUploading.value = false
  }
}

const handleCoverPhotoRemove = async () => {
  try {
    isUploading.value = true
    const response = await PhotoService.deleteCoverPhoto()
    if (response.success) {
      userStore.updateUserData({ coverPhoto: null })
      showCoverPhotoDialog.value = false
    }
  } catch (error) {
    console.error('Error removing cover photo:', error)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.cover-photo-container {
  position: relative;
  height: 300px;
  margin-bottom: 2rem;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-container {
  position: relative;
  margin-top: -60px;
  margin-left: 20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.cover-upload-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 10;
}

.cover-upload-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.avatar-upload-button {
  position: absolute;
  bottom: 0;
  right: 0;
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
  z-index: 30;
}

.avatar-upload-button:hover {
  background: rgba(0, 0, 0, 0.7);
}
</style>
