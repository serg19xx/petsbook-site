<template>
  <MainLayout>
    <!-- Left Sidebar Content -->
    <template #left-sidebar>
      <div class="space-y-4">
        <!-- Loading State -->
        <div v-if="userStore.loading" class="bg-white rounded-lg shadow p-4">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="userStore.error" class="bg-red-50 rounded-lg shadow p-4">
          <div class="text-red-600">{{ userStore.error }}</div>
        </div>

        <!-- Content -->
        <template v-else>
          <!-- Basic Profile Navigation -->
          <div class="bg-white rounded-lg shadow p-4">
            <nav class="space-y-2">
              <router-link
                to="/profile/edit"
                class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                :class="{ 'bg-gray-100': isActiveRoute('/profile/edit') }"
              >
                <Icon icon="mdi:account-edit" class="w-5 h-5 mr-3" />
                {{ t('profile.edit') }}
              </router-link>

              <!-- Role-specific sections -->
              <div v-if="userRole === 'petowner'" class="mt-4">
                <router-link
                  to="/profile/pets"
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  :class="{ 'bg-gray-100': isActiveRoute('/profile/pets') }"
                >
                  <Icon icon="mdi:paw" class="w-5 h-5 mr-3" />
                  {{ t('profile.pets') }}
                </router-link>
                <router-link
                  to="/profile/galleries"
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Icon icon="mdi:image-multiple" class="w-5 h-5 mr-3" />
                  {{ t('profile.galleries') }}
                </router-link>
              </div>

              <div v-if="userRole === 'business'" class="mt-4">
                <router-link
                  to="/profile/companies"
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Icon icon="mdi:domain" class="w-5 h-5 mr-3" />
                  {{ t('profile.companies') }}
                </router-link>
                <router-link
                  to="/profile/services"
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Icon icon="mdi:store" class="w-5 h-5 mr-3" />
                  {{ t('profile.services') }}
                </router-link>
              </div>

              <div v-if="userRole === 'producer'" class="mt-4">
                <router-link
                  to="/profile/agency"
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Icon icon="mdi:office-building" class="w-5 h-5 mr-3" />
                  {{ t('profile.agency') }}
                </router-link>
                <router-link
                  to="/profile/castings"
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Icon icon="mdi:camera-metering-matrix" class="w-5 h-5 mr-3" />
                  {{ t('profile.castings') }}
                </router-link>
              </div>
            </nav>
          </div>

          <!-- Stats Card -->
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-3">{{ t('profile.stats') }}</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">{{ t('profile.views') }}</span>
                <span class="font-medium">{{ profileStats.views }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">{{ t('profile.followers') }}</span>
                <span class="font-medium">{{ profileStats.followers }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">{{ t('profile.posts') }}</span>
                <span class="font-medium">{{ profileStats.posts }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
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
          {{ getRoleLabel }}
        </div>

        <!-- Role-specific content will be rendered here through router-view -->
        <router-view></router-view>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { Icon } from '@iconify/vue'
import MainLayout from '@/layouts/MainLayout.vue'
import UserProfileCard from '@/components/Profile/UserProfileCard.vue'
import { useI18n } from 'vue-i18n'
import PhotoUploader from '@/components/Profile/PhotoUploader.vue'
import { PhotoService } from '@/services/PhotoService'
import { optimizeAvatar, optimizeCoverPhoto } from '@/utils/imageUtils'
import Dialog from '@/components/ui/Dialog.vue'

const route = useRoute()
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
  console.log('UserProfileView - Вычисление isOwnProfile:')
  console.log('- route.params:', route.params)
  console.log('- userStore.userData:', userStore.userData)
  console.log('- userStore состояние:', {
    loading: userStore.loading,
    error: userStore.error,
    isAuthenticated: userStore.isAuthenticated
  })
  const result = !route.params.id || route.params.id === userStore.userData?.id
  console.log('- результат:', result)
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
  console.log('UserProfileView - Монтирование компонента')
  console.log('- начальное состояние userStore:', {
    userData: userStore.userData,
    loading: userStore.loading,
    error: userStore.error
  })

  if (!userStore.userData) {
    console.log('- загрузка данных пользователя...')
    try{
      await userStore.fetchUserData()
      console.log('- данные загружены:', userStore.userData)
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      }else{
        console.error('Error fetching user data:', error)
      }
    }
  }
})

// Следим за изменениями userData
watch(() => userStore.userData, (newVal) => {
  console.log('UserProfileView - userData изменился:', newVal)
}, { deep: true })

const userAvatar = computed(() => userStore.userData?.avatar)

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
