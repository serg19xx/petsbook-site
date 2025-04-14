<template>
  <div class="bg-white border-b">
    <!-- Cover Photo with Background Avatar -->
    <div class="relative h-36">
      <!-- Simple gray background by default -->
      <div class="absolute inset-0 bg-gray-100"></div>

      <!-- Edit button -->
      <div v-if="isOwnProfile" class="absolute top-4 right-4">
        <button class="bg-white/80 p-2 rounded-full hover:bg-white/90 transition-colors">
          <Icon icon="mdi:camera" class="w-5 h-5 text-gray-600" />
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
              :src="userData.avatar"
              alt="Profile picture"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
              <Icon icon="mdi:account" class="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <button
            v-if="isOwnProfile"
            class="absolute bottom-0 right-0 bg-white p-2 rounded-full hover:bg-gray-50 transition-colors shadow-md"
          >
            <Icon icon="mdi:camera" class="w-4 h-4 text-gray-600" />
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
              v-if="!isOwnProfile"
              @click="handleFollow"
              class="px-4 py-2 rounded-full font-medium"
              :class="isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'"
            >
              {{ isFollowing ? 'Following' : 'Follow' }}
            </button>
            <button
              v-if="!isOwnProfile"
              @click="handleMessage"
              class="px-4 py-2 bg-gray-100 rounded-full text-gray-800 font-medium hover:bg-gray-200"
            >
              Message
            </button>
            <button
              v-if="isOwnProfile"
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
            <span>Joined {{ new Date(userData?.dateCreated).toLocaleDateString() || 'Recently' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()

// Получаем данные из localStorage
const userData = computed(() => {
  const storedData = localStorage.getItem('userData')
  if (!storedData) return null
  const data = JSON.parse(storedData)
  return data?.user || data // поддержка обоих форматов данных
})

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
</script>

<style scoped>
/* Удалил неиспользуемые стили blur-sm */
</style>
