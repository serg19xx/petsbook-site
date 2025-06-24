<template>
  <div class="relative">
    <div class="bg-white border-b">
      <!-- Cover Photo with Background Avatar -->
      <div class="relative w-full h-[150px]">
        <!-- Simple gray background by default -->
        <div class="absolute inset-0 bg-gray-100">
          <img
            v-if="userData?.cover"
            :src="userData?.cover + '?t=' + Date.now()"
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
                v-if="userData?.avatar"
                :src="userStore.getAvatarUrl"
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

        <!-- Profile Content - разделяем на две колонки -->
        <div class="pt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Левая колонка (2/3) с информацией -->
          <div class="md:col-span-2">
            <!-- Имя без кнопки Edit -->
            <div class="mb-4">
              <h1 class="text-2xl font-bold text-gray-900">
                {{ userData?.fullName || userData?.nickname || userData?.email || 'Loading...' }}
              </h1>
              <div class="role-badge">
                {{ $t(`UI.roles.${userData?.role}`) }}
              </div>
            </div>

            <!-- Bio -->
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-500 mb-1">{{ $t('UI.usercard.about_me') }}</h3>
              <p class="text-gray-700">{{ userData?.aboutMe || $t('UI.usercard.no_bio') }}</p>
            </div>

            <!-- Контактная информация -->
            <div class="flex flex-col gap-2 text-gray-600 mb-6">
              <!-- Login Email -->
              <div v-if="userData?.email" class="flex items-center gap-2">
                <Icon icon="mdi:account" class="w-5 h-5" />
                <span class="flex items-center gap-1">
                  <span class="text-sm text-gray-500">{{ $t('UI.usercard.email') }}:</span>
                  {{ userData.email }}
                </span>
              </div>

              <!-- Contact Email -->
              <div v-if="userData?.contactEmail" class="flex items-center gap-2">
                <Icon icon="mdi:email" class="w-5 h-5" />
                <span class="flex items-center gap-1">
                  <span class="text-sm text-gray-500">{{ $t('UI.usercard.contact_info') }}:</span>
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
                <span>{{ $t('UI.usercard.profile.created') }} {{ formatDate(userData?.dateCreated) }}</span>
              </div>
            </div>

            <!-- Кнопка Edit Profile -->
            <div v-if="props.isOwnProfile" class="mt-4">
              <button
                @click="handleEdit"
                class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Icon icon="mdi:pencil" class="w-4 h-4" />
                {{ $t('UI.usercard.edit_profile') }}
              </button>
            </div>
          </div>

          <!-- Правая колонка (1/3) со статистикой -->
          <div class="md:col-span-1">
            <!-- PetPoints Balance -->
            <div class="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg p-4 mb-4 transition-all hover:shadow-md">
              <div class="flex items-center gap-2 mb-2">
                <Icon icon="mdi:currency-coin" class="w-6 h-6 text-amber-500" />
                <span class="text-amber-700 font-medium">PetPoints</span>
              </div>
              <div class="text-2xl font-bold text-amber-600">
                {{ formatNumber(userData?.stats?.points || 0) }}
                <span class="text-sm text-amber-500">PP</span>
              </div>
              <div class="text-sm text-amber-700 mt-1 flex items-center gap-1">
                <Icon icon="mdi:trending-up" class="w-4 h-4" />
                +{{ formatNumber(userData?.stats?.pointsLastMonth || 0) }} last month
              </div>
            </div>

            <!-- Статистика в компактных блоках -->
            <div class="space-y-3">
              <!-- Просмотры -->
              <div class="bg-blue-50 rounded-lg p-3 flex items-center justify-between transition-all hover:shadow-md">
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:eye" class="w-5 h-5 text-blue-500" />
                  <span class="text-sm font-medium text-blue-700">Profile Views</span>
                </div>
                <div class="text-xl font-bold text-blue-600">
                  {{ formatNumber(userData?.stats?.viewsCount || 0) }}
                </div>
              </div>

              <!-- Лайки -->
              <div class="bg-red-50 rounded-lg p-3 flex items-center justify-between transition-all hover:shadow-md">
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:heart" class="w-5 h-5 text-red-500" />
                  <span class="text-sm font-medium text-red-700">Received Likes</span>
                </div>
                <div class="text-xl font-bold text-red-600">
                  {{ formatNumber(userData?.stats?.likesCount || 0) }}
                </div>
              </div>

              <!-- Посты -->
              <div class="bg-green-50 rounded-lg p-3 flex items-center justify-between transition-all hover:shadow-md">
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:post-outline" class="w-5 h-5 text-green-500" />
                  <span class="text-sm font-medium text-green-700">Posts</span>
                </div>
                <div class="text-xl font-bold text-green-600">
                  {{ formatNumber(userData?.stats?.postsCount || 0) }}
                </div>
              </div>
            </div>

            <!-- Социальные сети -->
            <div class="mt-6 flex items-center justify-end gap-3">
              <a
                v-if="userData?.social?.youtube"
                :href="userData.social.youtube"
                target="_blank"
                class="text-gray-500 hover:text-red-600 transition-colors"
                title="YouTube"
              >
                <Icon icon="mdi:youtube" class="w-6 h-6" />
              </a>
              <a
                v-if="userData?.social?.facebook"
                :href="userData.social.facebook"
                target="_blank"
                class="text-gray-500 hover:text-blue-600 transition-colors"
                title="Facebook"
              >
                <Icon icon="mdi:facebook" class="w-6 h-6" />
              </a>
              <a
                v-if="userData?.social?.instagram"
                :href="userData.social.instagram"
                target="_blank"
                class="text-gray-500 hover:text-pink-600 transition-colors"
                title="Instagram"
              >
                <Icon icon="mdi:instagram" class="w-6 h-6" />
              </a>
              <a
                v-if="userData?.social?.tiktok"
                :href="userData.social.tiktok"
                target="_blank"
                class="text-gray-500 hover:text-black transition-colors"
                title="TikTok"
              >
                <Icon icon="mdi:tiktok" class="w-6 h-6" />
              </a>
              <a
                v-if="userData?.social?.telegram"
                :href="userData.social.telegram"
                target="_blank"
                class="text-gray-500 hover:text-blue-500 transition-colors"
                title="Telegram"
              >
                <Icon icon="mdi:telegram" class="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог редактирования аватара -->
    <Dialog
      :modelValue="showPhotoDialog"
      :title="t('UI.profilecard.dialog.edit_avatar')"
      size="lg"
      :hide-footer="true"
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
      :modelValue="showCoverPhotoDialog"
      :title="t('UI.profilecard.dialog.edit_cover')"
      size="lg"
      :hide-footer="true"
      @update:modelValue="showCoverPhotoDialog = $event"
      @close="showCoverPhotoDialog = false"
    >
      <CoverEditor
        @save="handleCoverPhotoSave"
        @cancel="showCoverPhotoDialog = false"
      />
    </Dialog>
  </div>
</template>
<!-- eslint-disable no-undef -->
<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useAuthStore } from '@/stores/AuthStore'
import { useI18n } from 'vue-i18n'
import { formatInTimeZone } from 'date-fns-tz'
import { format } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
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
const authStore = useAuthStore()
const { t, locale } = useI18n()

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

const formatDate = (date) => {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Выбираем нужную локаль из date-fns
    const dateFnsLocale = locale.value === 'ru' ? ru : enUS

    const formatted = formatInTimeZone(
      dateObj,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      'd MMMM yyyy',
      { locale: dateFnsLocale }
    )

    return formatted
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

const showPhotoDialog = ref(false)
const showCoverPhotoDialog = ref(false)
const tempCover = ref(null)
const tempAvatar = ref(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Добавляем обработчики для кнопок
const handleCoverClick = () => {
  showCoverPhotoDialog.value = true
}

const handleAvatarClick = () => {
  showPhotoDialog.value = true
}

const handleAvatarSave = async (file) => {
  try {
    // Временный предпросмотр
    //const reader = new FileReader()
    //reader.onload = (e) => {
    //  tempAvatar.value = e.target.result
    //}
    //reader.readAsDataURL(file)

    // Загружаем на сервер
    const response = await PhotoService.uploadPhoto(file, 'avatar')

    if (response.success) {
      // Формируем полный URL для аватара
      const fullAvatarUrl = response.path.startsWith('http')
        ? response.path
        : `${API_BASE_URL}${response.path}`
      // Обновляем в store, что обновит аватар везде
            // Обновляем в store
            /*
      await userStore.updateUserData({
        avatar: fullAvatarUrl,

        _timestamp: Date.now()
      })
*/
      //const avatarUrlWithCacheBusting = `${fullAvatarUrl}?t=${Date.now()}`
      authStore.loginInfo = {
        ...authStore.loginInfo,
        avatar: `${fullAvatarUrl}?t=${Date.now()}`
      }
      await userStore.fetchUserData()
    }

    // Закрываем диалог
    showPhotoDialog.value = false
  } catch (error) {
    console.error('Error handling avatar:', error)
  }
}

// И аналогично для обложки
const handleCoverPhotoSave = async (file) => {
  try {
    //const reader = new FileReader()
    //reader.onload = (e) => {
    //  tempCover.value = e.target.result
    //}
    //reader.readAsDataURL(file)

    const response = await PhotoService.uploadPhoto(file, 'cover')
    if (response.success) {
      const fullCoverUrl = response.path.startsWith('http')
        ? response.path
        : `${API_BASE_URL}${response.path}`

        //tempCover.value = `${fullCoverUrl}?t=${Date.now()}`

        /*
      await userStore.updateUserData({
        cover: fullCoverUrl,

        _timestamp: Date.now()
      })
        */
      await userStore.fetchUserData()
    }

    showCoverPhotoDialog.value = false
  } catch (error) {
    console.error('Error handling cover:', error)
  }
}

// В script setup добавляем
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>

<style scoped>
.dialog-overlay {
  z-index: 1000;
}

.dialog-content {
  z-index: 1001;
}
</style>
