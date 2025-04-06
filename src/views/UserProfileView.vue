<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Profile Card -->
      <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <!-- Profile Header -->
        <div class="flex items-center space-x-4 mb-6">
          <img
            :src="userAvatar"
            alt="Profile"
            class="w-20 h-20 rounded-full border-2 border-gray-200"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ userName }}</h1>
            <p class="text-gray-600">{{ userEmail }}</p>
          </div>
        </div>

        <!-- Profile Info -->
        <div class="space-y-4">
          <div class="border-b pb-4">
            <h2 class="text-lg font-semibold mb-2">Основная информация</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">Имя:</p>
                <p class="font-medium">{{ userName }}</p>
              </div>
              <div>
                <p class="text-gray-600">Email:</p>
                <p class="font-medium">{{ userEmail }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-4">
            <button
              @click="editProfile"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Редактировать профиль
            </button>
            <button
              @click="changePassword"
              class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Изменить пароль
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

const router = useRouter()
const authStore = useAuthStore()

// User data
const userName = computed(() => authStore.user?.name || 'Пользователь')
const userEmail = computed(() => authStore.user?.email || '')
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')

// Actions
const editProfile = () => {
  router.push('/settings/profile')
}

const changePassword = () => {
  router.push('/settings/security')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>
