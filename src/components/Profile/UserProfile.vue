<template>
  <div class="profile-container">
    <!-- Загрузка -->
    <div v-if="userStore.loading" class="flex justify-center items-center min-h-[200px]">
      <div class="loading-spinner" />
    </div>

    <!-- Ошибка -->
    <div v-else-if="userStore.error" class="text-red-500 text-center p-4">
      {{ userStore.error }}
    </div>

    <!-- Контент профиля -->
    <div v-else class="profile-content">
      <!-- Обложка профиля -->
      <div class="relative h-48">
        <img
          :src="userStore.profileData?.cover || '/default-cover.jpg'"
          class="w-full h-full object-cover"
          alt="Profile cover"
        />
        <button
          v-if="isOwnProfile"
          @click="triggerCoverUpload"
          class="absolute bottom-2 right-2 bg-white/80 rounded-full p-2"
        >
          <Icon icon="mdi:camera" />
        </button>
      </div>

      <!-- Аватар и основная информация -->
      <div class="relative -mt-16 px-4">
        <div class="flex items-end">
          <div class="relative">
            <img
              :src="userStore.profileData?.avatar || '/default-avatar.jpg'"
              class="w-32 h-32 rounded-full border-4 border-white"
              alt="Profile avatar"
            />
            <button
              v-if="isOwnProfile"
              @click="triggerAvatarUpload"
              class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow"
            >
              <Icon icon="mdi:camera" />
            </button>
          </div>

          <div class="ml-4 flex-grow">
            <h1 class="text-2xl font-bold">
              {{ userStore.userData?.name }}
            </h1>
            <p class="text-gray-600">
              {{ userStore.profileData?.bio || 'Нет описания' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div class="mt-6 px-4">
        <!-- Контакты -->
        <div v-if="userStore.profileData?.contacts" class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Контакты</h2>
          <div class="space-y-2">
            <div v-for="(contact, key) in userStore.profileData.contacts" :key="key">
              <Icon :icon="getContactIcon(key)" />
              <span class="ml-2">{{ contact }}</span>
            </div>
          </div>
        </div>

        <!-- Кнопка редактирования -->
        <button
          v-if="isOwnProfile"
          @click="openEditProfile"
          class="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          Редактировать профиль
        </button>
      </div>
    </div>

    <!-- Скрытые input для загрузки файлов -->
    <input
      ref="avatarInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleAvatarUpload"
    />
    <input
      ref="coverInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleCoverUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()

const avatarInput = ref(null)
const coverInput = ref(null)

// Проверяем, смотрит ли пользователь свой профиль
const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id === userStore.userData?.id
})

onMounted(async () => {
  await userStore.fetchUserData()
  await userStore.fetchProfileData()
})

// Методы для загрузки файлов
const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

const triggerCoverUpload = () => {
  coverInput.value.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    await userStore.uploadAvatar(file)
  }
}

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    await userStore.uploadCover(file)
  }
}

const getContactIcon = (type) => {
  const icons = {
    email: 'mdi:email',
    phone: 'mdi:phone',
    website: 'mdi:web',
    // Добавьте другие типы контактов по необходимости
  }
  return icons[type] || 'mdi:account'
}

const openEditProfile = () => {
  // Реализация открытия формы редактирования
}
</script>
