<template>
  <MainLayout>
    <!-- Left Sidebar Content -->
    <template #left-sidebar>
      <div class="space-y-4">
        <!-- Basic Profile Navigation -->
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

            <!-- Role-specific sections -->
            <div v-if="userRole === 'petowner'" class="mt-4">
              <router-link
                to="/profile/pets"
                class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                :class="{ 'bg-gray-100': isActiveRoute('/profile/pets') }"
              >
                <Icon icon="mdi:paw" class="w-5 h-5 mr-3" />
                Мои питомцы
              </router-link>
              <router-link
                to="/profile/galleries"
                class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Icon icon="mdi:image-multiple" class="w-5 h-5 mr-3" />
                Галереи
              </router-link>
            </div>

            <div v-if="userRole === 'business'" class="mt-4">
              <router-link
                to="/profile/companies"
                class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Icon icon="mdi:domain" class="w-5 h-5 mr-3" />
                Мои компании
              </router-link>
              <router-link
                to="/profile/services"
                class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Icon icon="mdi:store" class="w-5 h-5 mr-3" />
                Услуги
              </router-link>
            </div>

            <div v-if="userRole === 'producer'" class="mt-4">
              <router-link
                to="/profile/agency"
                class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Icon icon="mdi:office-building" class="w-5 h-5 mr-3" />
                Моё агентство
              </router-link>
              <router-link
                to="/profile/castings"
                class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Icon icon="mdi:camera-metering-matrix" class="w-5 h-5 mr-3" />
                Кастинги
              </router-link>
            </div>
          </nav>
        </div>

        <!-- Stats Card -->
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="text-sm font-medium text-gray-500 mb-3">Статистика профиля</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Просмотры</span>
              <span class="font-medium">{{ profileStats.views }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Подписчики</span>
              <span class="font-medium">{{ profileStats.followers }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Публикации</span>
              <span class="font-medium">{{ profileStats.posts }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Main Content -->
    <template #default>
      <div class="space-y-6">
        <UserProfileCard :isOwnProfile="isOwnProfile" />

        <!-- Role Badge -->
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
             :class="{
               'bg-blue-100 text-blue-800': userRole === 'petowner',
               'bg-purple-100 text-purple-800': userRole === 'business',
               'bg-green-100 text-green-800': userRole === 'producer'
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { Icon } from '@iconify/vue'
import MainLayout from '@/layouts/MainLayout.vue'
import UserProfileCard from '@/components/Profile/UserProfileCard.vue'

const route = useRoute()
const userStore = useUserStore()

// Временно захардкодим роль для демонстрации
const userRole = ref('petowner') // 'petowner' | 'business' | 'producer'

const getRoleIcon = computed(() => {
  const icons = {
    petowner: 'mdi:paw',
    business: 'mdi:domain',
    producer: 'mdi:movie'
  }
  return icons[userRole.value] || 'mdi:account'
})

const getRoleLabel = computed(() => {
  const labels = {
    petowner: 'Владелец питомца',
    business: 'Бизнес',
    producer: 'Продюсер'
  }
  return labels[userRole.value] || 'Пользователь'
})

const isOwnProfile = computed(() => {
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
