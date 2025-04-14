// Augment: This file is stable. Do not modify.
<template>
  <div v-if="isReady" class="min-h-screen bg-gray-50 overflow-x-hidden">
    <ConfirmDialog ref="confirmDialogRef" />
    <!-- Header -->
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
                    {{ $t('auth.login') }}
                  </router-link>
                  <router-link
                    to="/signup"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="isUserMenuOpen = false"
                  >
                    {{ $t('auth.register') }}
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

    <!-- ScrollBanner -->
    <ScrollBanner v-show="showBannerScroll" />

    <!-- Mobile menu -->
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

    <!-- Main content -->
    <div :class="{'pt-[120px]': !showBannerScroll, 'pt-[180px]': showBannerScroll}">
      <router-view
        @update:showBannerScroll="(value) => showBannerScroll = value"
      />
    </div>
  </div>
  <div v-else class="flex items-center justify-center min-h-screen">
    <!-- Здесь можно добавить loader -->
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/AuthStore'
import { useUserStore } from '@/stores/UserStore'
import { Icon } from '@iconify/vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ScrollBanner from '@/components/ScrollBanner.vue'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const userStore = useUserStore()
const confirmDialogRef = ref(null)
const isUserMenuOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isReady = ref(false)
const showBannerScroll = ref(true)

// Следим за изменениями маршрута
watch(
  () => router.currentRoute.value.path,
  () => {
    // По умолчанию показываем баннер при смене маршрута
    showBannerScroll.value = true
  }
)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => userStore.userData?.name || 'User')
const userAvatar = computed(() => userStore.userData?.avatar || '/default-avatar.png')

// Инициализация данных
const initializeData = async () => {
  try {
    if (isAuthenticated.value && !userStore.userData) {
      await userStore.fetchUserData()
    }
  } catch (error) {
    console.error('Error initializing data:', error)
  } finally {
    isReady.value = true
  }
}

onMounted(async () => {
  await initializeData()
})

// Следим за изменением статуса аутентификации
watch(() => authStore.isAuthenticated, async (newValue) => {
  if (newValue && !userStore.userData) {
    await userStore.fetchUserData()
  }
})

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
  const confirmed = await confirmDialogRef.value.show({
    title: t('confirm_dialog.logout.title'),
    message: t('confirm_dialog.logout.message')
  })

  if (confirmed) {
    try {
      const result = await authStore.logout()
      if (result.success) {
        isUserMenuOpen.value = false
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  } else {
    isUserMenuOpen.value = false
  }
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
