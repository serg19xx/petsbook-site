<template>
  <div class="bg-white border-b">
    <!-- Заменены shadow-md и rounded-lg на border-b -->
    <!-- Cover Photo -->
    <div class="relative h-36 bg-gray-200">
      <img
        v-if="userData?.coverPhoto"
        :src="userData.coverPhoto"
        alt="Cover photo"
        class="w-full h-full object-cover"
      />
      <div v-if="isOwnProfile" class="absolute top-4 right-4">
        <button class="bg-white p-2 rounded-full hover:bg-gray-100">
          <!-- Убрана shadow-md -->
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
            <!-- Убрана shadow-lg -->
            <img
              v-if="userData?.avatar"
              :src="userData.avatar"
              alt="Profile picture"
              class="w-full h-full object-cover"
            />
          </div>
          <button
            v-if="isOwnProfile"
            class="absolute bottom-0 right-0 bg-white p-2 rounded-full hover:bg-gray-100"
          >
            <!-- Убрана shadow-md -->
            <Icon icon="mdi:camera" class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Profile Header -->
      <div class="pt-14">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ userData?.name || 'Loading...' }}
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

        <!-- Bio -->
        <p class="text-gray-700 mb-4">{{ userData?.bio || 'No bio available' }}</p>

        <!-- Stats -->
        <div class="flex gap-6 mb-4">
          <div class="text-center">
            <div class="font-bold">{{ userData?.stats?.posts || 0 }}</div>
            <div class="text-sm text-gray-600">Posts</div>
          </div>
          <div class="text-center">
            <div class="font-bold">{{ userData?.stats?.followers || 0 }}</div>
            <div class="text-sm text-gray-600">Followers</div>
          </div>
          <div class="text-center">
            <div class="font-bold">{{ userData?.stats?.following || 0 }}</div>
            <div class="text-sm text-gray-600">Following</div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="flex flex-col gap-2 text-gray-600">
          <div v-if="userData?.location" class="flex items-center gap-2">
            <Icon icon="mdi:map-marker" class="w-5 h-5" />
            <span>{{ userData.location }}</span>
          </div>
          <div v-if="userData?.website" class="flex items-center gap-2">
            <Icon icon="mdi:link-variant" class="w-5 h-5" />
            <a :href="userData.website" target="_blank" class="text-blue-600 hover:underline">
              {{ userData.website }}
            </a>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="mdi:calendar" class="w-5 h-5" />
            <span>Joined {{ userData?.joinDate || 'Recently' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()

// Временные данные для демонстрации
const userData = ref({
  name: 'John Doe',
  role: 'petowner',
  avatar: null,
  coverPhoto: null,
  bio: 'Pet lover and enthusiast',
  location: 'New York, USA',
  website: 'https://example.com',
  joinDate: 'January 2024',
  stats: {
    posts: 42,
    followers: 1234,
    following: 567,
  },
})

const roleLabels = {
  petowner: 'Владелец питомца',
  business: 'Бизнес',
  producer: 'Продюсер',
}

const isFollowing = ref(false)

const handleFollow = () => {
  isFollowing.value = !isFollowing.value
}

const handleMessage = () => {
  console.log('Message button clicked')
}

const handleEdit = () => {
  router.push({ name: 'profile-edit' })
}
</script>
