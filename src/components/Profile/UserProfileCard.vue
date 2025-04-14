<template>
  <div class="relative">
    <div class="bg-white border-b">
      <!-- Cover Photo with Background Avatar -->
      <div class="relative w-full h-[150px]">
        <!-- Simple gray background by default -->
        <div class="absolute inset-0 bg-gray-100">
          <img
            v-if="userData?.coverPhoto || tempCover"
            :src="tempCover || userData?.coverPhoto"
            alt="Cover"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="absolute top-4 right-4">
          <button
            v-if="props.isOwnProfile"
            @click="handleCoverClick"
            class="bg-white/80 p-1.5 rounded-full hover:bg-white/90 transition-colors shadow-md z-10"
          >
            <Icon icon="mdi:camera" class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Profile Info -->
      <div class="relative px-6 pb-6">
        <!-- Avatar -->
        <div class="absolute -top-12 left-6">
          <div class="relative">
            <div class="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
              <img
                v-if="userData?.avatar || tempAvatar"
                :src="tempAvatar || userData?.avatar"
                alt="Profile picture"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                <Icon icon="mdi:account" class="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <button
              v-if="props.isOwnProfile"
              @click="handleAvatarClick"
              class="absolute bottom-0 right-0 bg-white/80 p-1.5 rounded-full hover:bg-white/90 transition-colors shadow-md"
            >
              <Icon icon="mdi:eye" class="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Profile Header -->
        <div class="pt-14">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ userData?.fullName || userData?.nickname || 'Loading...' }}
              </h1>
              <p class="text-gray-600">{{ roleLabels[userData?.role] || 'User' }}</p>
            </div>
            <div class="flex gap-2">
              <button
                v-if="props.isOwnProfile"
                @click="handleEdit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <!-- Bio/About Me -->
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-500 mb-1">About Me</h3>
            <p class="text-gray-700">{{ userData?.aboutMe || 'No bio available' }}</p>
          </div>

          <!-- Additional Info -->
          <div class="flex flex-col gap-2 text-gray-600">
            <!-- Login Email -->
            <div v-if="userData?.email" class="flex items-center gap-2">
              <Icon icon="mdi:account" class="w-5 h-5" />
              <span class="flex items-center gap-1">
                <span class="text-sm text-gray-500">Login:</span>
                {{ userData.email }}
              </span>
            </div>

            <!-- Contact Email -->
            <div v-if="userData?.contactEmail" class="flex items-center gap-2">
              <Icon icon="mdi:email" class="w-5 h-5" />
              <span class="flex items-center gap-1">
                <span class="text-sm text-gray-500">Contact:</span>
                {{ userData.contactEmail }}
              </span>
            </div>

            <!-- Location -->
            <div v-if="formattedAddress" class="flex items-center gap-2">
              <Icon icon="mdi:map-marker" class="w-5 h-5" />
              <span>{{ formattedAddress }}</span>
            </div>

            <!-- Website -->
            <div v-if="userData?.website" class="flex items-center gap-2">
              <Icon icon="mdi:link-variant" class="w-5 h-5" />
              <a :href="userData.website" target="_blank" class="text-blue-600 hover:underline">
                {{ userData.website }}
              </a>
            </div>

            <!-- Phone -->
            <div v-if="userData?.phone" class="flex items-center gap-2">
              <Icon icon="mdi:phone" class="w-5 h-5" />
              <span>{{ userData.phone }}</span>
            </div>

            <!-- Join Date -->
            <div class="flex items-center gap-2">
              <Icon icon="mdi:calendar" class="w-5 h-5" />
              <span>{{ $t('profile.joined') }} {{ formatDate(userData?.dateCreated) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог редактирования аватара -->
    <Dialog
      :modelValue="showPhotoDialog"
      :title="t('profile.editAvatar')"
      size="lg"
      @update:modelValue="showPhotoDialog = $event"
      @close="showPhotoDialog = false"
    >
      <AvatarEditor
        @save="handleAvatarSave"
        @cancel="showPhotoDialog = false"
      />
    </Dialog>

    <!-- Диалог редактирования подложки -->
    <Dialog
      :modelValue="showCoverDialog"
      :title="t('profile.editCover')"
      size="lg"
      @update:modelValue="showCoverDialog = $event"
      @close="showCoverDialog = false"
    >
      <CoverEditor
        @save="handleCoverSave"
        @cancel="showCoverDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { formatInTimeZone } from 'date-fns-tz'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Dialog from '@/components/ui/Dialog.vue'
import AvatarEditor from '@/components/Profile/AvatarEditor.vue'
import CoverEditor from './CoverEditor.vue'
import { PhotoService } from '@/services/PhotoService'

const props = defineProps({
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

// Расширенное логирование
console.log('UserProfileCard - Инициализация компонента')
console.log('- props.isOwnProfile:', props.isOwnProfile)
console.log('- userStore.userData:', userStore.userData)
console.log('- userStore состояние:', {
  loading: userStore.loading,
  error: userStore.error,
  isAuthenticated: userStore.isAuthenticated
})

const showPhotoDialog = ref(false)
const showCoverDialog = ref(false)
const tempCover = ref(null)
const tempAvatar = ref(null)

// Добавляем watch для отладки
watch(showPhotoDialog, (newVal) => {
  console.log('showPhotoDialog changed:', newVal)
  console.log('Dialog element exists:', document.querySelector('.dialog-content'))
})

watch(showCoverDialog, (newVal) => {
  console.log('showCoverDialog changed:', newVal)
  console.log('Dialog element exists:', document.querySelector('.dialog-content'))
})

// Получаем данные из UserStore
const userData = computed(() => userStore.userData)

// Форматируем адрес
const formattedAddress = computed(() => {
  if (!userData.value?.location?.components) return userData.value?.location?.fullAddress

  const components = userData.value.location.components
  const parts = []

  if (components.city) parts.push(components.city)
  if (components.region) parts.push(components.region)
  if (components.country) parts.push(components.country)

  return parts.join(', ') || userData.value?.location?.fullAddress
})

const roleLabels = {
  petowner: 'Владелец питомца',
  business: 'Бизнес',
  producer: 'Продюсер',
  user: 'Пользователь'
}

const isFollowing = ref(false)

const handleFollow = () => {
  isFollowing.value = !isFollowing.value
}

const handleMessage = () => {
  // Реализация отправки сообщения
}

const handleEdit = () => {
  router.push('/profile/edit')
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    // Форматируем дату с учетом часового пояса пользователя
    return formatInTimeZone(date, Intl.DateTimeFormat().resolvedOptions().timeZone, 'd MMMM yyyy', { locale: ru })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

const handleAvatarSave = async (file) => {
  try {
    // Сохраняем в состоянии компонента для предпросмотра
    const reader = new FileReader()
    reader.onload = (e) => {
      tempAvatar.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Загружаем на сервер
    const response = await PhotoService.uploadPhoto(file, 'avatar')
    if (response.success) {
      // Обновляем аватар в UserStore с URL
      await userStore.updateUserData({ avatar: response.url })
    }

    // Закрываем диалог
    showPhotoDialog.value = false
  } catch (error) {
    console.error('Error handling avatar:', error)
  }
}

const handleCoverSave = async (file) => {
  try {
    // Сохраняем в состоянии компонента для предпросмотра
    const reader = new FileReader()
    reader.onload = (e) => {
      tempCover.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Загружаем на сервер
    const response = await PhotoService.uploadPhoto(file, 'cover')
    if (response.success) {
      // Обновляем обложку в UserStore с URL
      await userStore.updateUserData({ coverPhoto: response.url })
    }

    // Закрываем диалог
    showCoverDialog.value = false
  } catch (error) {
    console.error('Error handling cover:', error)
  }
}

// Добавляем обработчики для кнопок
const handleCoverClick = () => {
  console.log('Cover button clicked')
  showCoverDialog.value = true
  console.log('showCoverDialog after click:', showCoverDialog.value)

  // Проверяем монтирование диалога
  nextTick(() => {
    console.log('UserProfileCard - проверка диалога после nextTick')
    const dialog = document.querySelector('.dialog-content')
    console.log('- dialog element:', dialog)
  })
}

const handleAvatarClick = () => {
  console.log('Avatar button clicked')
  showPhotoDialog.value = true
  console.log('showPhotoDialog after click:', showPhotoDialog.value)
}

// Добавляем watch для отладки
watch(() => props.isOwnProfile, (newVal) => {
  console.log('UserProfileCard - isOwnProfile changed:', newVal)
})

// Следим за изменениями userData
watch(() => userStore.userData, (newVal) => {
  console.log('UserProfileCard - userData изменился:', newVal)
}, { deep: true })
</script>

<style scoped>
/* Удалил неиспользуемые стили blur-sm */

.dialog-overlay {
  z-index: 1000;
}

.dialog-content {
  z-index: 1001;
}
</style>
