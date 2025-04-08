<template>
  <MainLayout>
    <!-- Left Sidebar Content -->
    <template #left-sidebar>
      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow p-4">
          <nav class="space-y-2">
            <router-link
              to="/profile/edit"
              class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              :class="{ 'bg-gray-100': isActiveRoute('/profile/edit') }"
            >
              <Icon icon="mdi:account-edit" class="w-5 h-5 mr-3" />
              Редактировать профиль
            </router-link>
          </nav>
        </div>
      </div>
    </template>

    <!-- Main Content -->
    <template #default>
      <div class="space-y-6">
        <UserProfileCard :isOwnProfile="isOwnProfile" />
      </div>
    </template>

    <!-- Right Sidebar Content -->
    <template #right-sidebar>
      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="font-semibold mb-4">Статистика профиля</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Просмотры</span>
              <span class="font-medium">{{ profileStats.views }}</span>
            </div>
            <div class="flex justify-between">
              <span>Подписчики</span>
              <span class="font-medium">{{ profileStats.followers }}</span>
            </div>
            <div class="flex justify-between">
              <span>Публикации</span>
              <span class="font-medium">{{ profileStats.posts }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { Icon } from '@iconify/vue'
import MainLayout from '@/layouts/MainLayout.vue'
import UserProfileCard from '@/components/Profile/UserProfileCard.vue'

const route = useRoute()
const userStore = useUserStore()

const isOwnProfile = computed(() => {
  // Здесь логика определения, является ли текущий профиль профилем текущего пользователя
  return true // Временно всегда true
})

const profileStats = ref({
  views: 1234,
  followers: 567,
  posts: 42
})

const isActiveRoute = (path) => {
  return route.path === path
}
</script>
