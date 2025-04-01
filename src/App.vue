// Augment: This file is stable. Do not modify.
<template>
  <div>
    <!-- Верхняя строка меню -->
    <header class="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div class="container mx-auto">
        <!-- Первая строка: логотип и язык -->
        <div class="px-4 py-3 flex justify-between items-center border-b">
          <router-link to="/" class="text-xl font-bold text-sky-900">Petsbook</router-link>
          <LanguageSwitcher />
        </div>

        <!-- Вторая строка: навигация и пользователь -->
        <nav class="px-4 py-3 flex justify-between items-center">
          <!-- Левая часть - главное меню -->
          <div class="flex items-center">
            <!-- Кнопка меню для мобильных устройств -->
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
            >
              <Icon icon="mdi:menu" class="w-6 h-6" />
            </button>
            <!-- Десктопное меню -->
            <div class="hidden lg:flex space-x-4">
              <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="text-gray-600 hover:text-gray-900"
              >
                {{ $t(`navigation.${item.label}`) }}
              </router-link>
            </div>
          </div>

          <!-- Правая часть меню -->
          <div class="flex items-center space-x-4 ml-auto">
            <!-- Поиск -->
            <button class="text-gray-600 hover:text-gray-900">
              <Icon icon="mdi:magnify" class="w-6 h-6" />
            </button>

            <!-- Уведомления -->
            <button class="text-gray-600 hover:text-gray-900">
              <Icon icon="mdi:bell-outline" class="w-6 h-6" />
            </button>

            <!-- Профиль пользователя -->
            <div class="relative user-menu-container">
              <button @click="isUserMenuOpen = !isUserMenuOpen" class="flex items-center space-x-2">
                <Icon
                  v-if="!isAuthenticated"
                  icon="mdi:account-outline"
                  class="w-8 h-8 text-gray-600"
                />
                <img v-else :src="userAvatar" alt="User avatar" class="w-8 h-8 rounded-full" />
              </button>
              <!-- Выпадающее меню -->
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
              >
                <!-- Меню для гостя -->
                <template v-if="!isAuthenticated">
                  <router-link
                    to="/login"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="isUserMenuOpen = false"
                  >
                    {{ $t('navigation.user_menu.login') }}
                  </router-link>
                  <router-link
                    to="/signup"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="isUserMenuOpen = false"
                  >
                    {{ $t('navigation.user_menu.register') }}
                  </router-link>
                </template>
                <!-- Меню для авторизованного пользователя -->
                <template v-else>
                  <router-link
                    v-for="item in userMenuItems"
                    :key="item.path"
                    :to="item.path"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="isUserMenuOpen = false"
                  >
                    {{ $t(`navigation.user_menu.${item.label}`) }}
                  </router-link>
                  <MenuItem v-if="authStore.isAuthenticated">
                    <router-link
                      to="/settings/security"
                      class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <i class="pi pi-shield mr-2"></i>
                      Безопасность
                    </router-link>
                  </MenuItem>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {{ $t('navigation.user_menu.logout') }}
                  </button>
                </template>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <!-- Мобильное меню (сайдбар) -->
    <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 z-40">
      <!-- Затемнение фона -->
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="isMobileMenuOpen = false"></div>

      <!-- Сайдбар -->
      <div class="fixed top-[120px] bottom-0 left-0 w-64 bg-white shadow-lg overflow-y-auto">
        <div class="p-4">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">{{ $t('navigation.menu') }}</h2>
            <button @click="isMobileMenuOpen = false" class="text-gray-600 hover:text-gray-900">
              <Icon icon="mdi:close" class="w-6 h-6" />
            </button>
          </div>

          <!-- Пункты меню -->
          <nav class="space-y-2">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="isMobileMenuOpen = false"
            >
              {{ $t(`navigation.${item.label}`) }}
            </router-link>
          </nav>
        </div>
      </div>
    </div>

    <!-- Основной контент с отступом под фиксированное меню -->
    <div class="pt-[120px]">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { Icon } from '@iconify/vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const isUserMenuOpen = ref(false)
const isMobileMenuOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.name || 'User')
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')

const menuItems = [
  { path: '/', label: 'home' },
  { path: '/pets', label: 'pets' },
  { path: '/posts', label: 'posts' },
  { path: '/advertising', label: 'advertising' },
]

const userMenuItems = [
  { path: '/profile', label: 'my_profile' },
  { path: '/settings', label: 'settings' },
  { path: '/help', label: 'help' },
]

const handleLogout = async () => {
  await authStore.logout()
  isUserMenuOpen.value = false
  router.push('/login')
}

// Добавляем обработчик клика вне меню
const handleClickOutside = (event) => {
  if (isUserMenuOpen.value && !event.target.closest('.user-menu-container')) {
    isUserMenuOpen.value = false
  }
}

// Добавляем и удаляем слушатель при монтировании/размонтировании компонента
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
