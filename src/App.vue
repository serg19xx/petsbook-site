<template>
  <!-- Показываем лоадер, пока authStore не готов (это очень быстро) -->
  <div v-if="!authStore.isReady" class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>

  <!-- Как только authStore готов, показываем приложение -->
  <div v-else class="min-h-screen bg-gray-50 overflow-x-hidden">
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
                {{ $t(`UI.mainmenu.link.${item.label}`) }}
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
                  v-if="!authStore.isAuthenticated"
                  icon="mdi:account-outline"
                  class="w-8 h-8 text-gray-600"
                />
                <img v-else :src="userStore.getAvatarUrl" alt="" class="w-8 h-8 rounded-full" />
              </button>
              <!-- Выпадающее меню -->
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
              >
                <!-- Меню для гостя -->
                <template v-if="!authStore.isAuthenticated">
                  <router-link
                    to="/login"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="isUserMenuOpen = false"
                  >
                    {{ $t('UI.usermenu.link.login') }}
                  </router-link>
                  <router-link
                    to="/signup"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="isUserMenuOpen = false"
                  >
                    {{ $t('UI.usermenu.link.register') }}
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
                    {{ $t(`UI.usermenu.link.${item.label}`) }}
                  </router-link>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {{ $t('UI.usermenu.button.logout') }}
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
            <h2 class="text-xl font-bold text-gray-900">{{ $t('UI.mainmenu.h2.title') }}</h2>
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
              {{ $t(`UI.mainmenu.link.${item.label}`) }}
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
</template>

<!-- eslint-disable no-undef -->
<script setup>
import { useTrackVisit } from '@/composables/useTrackVisit'
import { ref, onMounted, onUnmounted, watch, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/AuthStore'
import { useUserStore } from '@/stores/UserStore'
import { Icon } from '@iconify/vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ScrollBanner from '@/components/ScrollBanner.vue'
import { useLanguageStore } from '@/stores/LanguageStore'

useTrackVisit()

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const userStore = useUserStore()
const confirmDialogRef = ref(null)
const isUserMenuOpen = ref(false)
const isMobileMenuOpen = ref(false)
const showBannerScroll = ref(true)
const loginData = ref(null)
const languageStore = useLanguageStore()

const currentLangObj = computed(() =>
  languageStore.currentLanguage
    ? languageStore.locales.find(l => l.code === languageStore.currentLanguage)
    : null
)

watch(
  () => languageStore.currentLanguage,
  () => {
    // Найди объект языка по коду
    const current = currentLangObj.value
    // Установи направление текста
    if (current && current.direction === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl')
    } else {
      document.documentElement.setAttribute('dir', 'ltr')
    }
  },
  { immediate: true }
)

watch(
  () => router.currentRoute.value.path,
  () => {
    // По умолчанию показываем баннер при смене маршрута
    showBannerScroll.value = true
  }
)

onMounted(async () => {
  // Проверяем, нужно ли загружать данные пользователя
  // Если пользователь аутентифицирован, но данные не загружены И не загружаются сейчас
  if (authStore.isAuthenticated && !userStore.userData && !userStore.loading) {
    console.log('🔄 App.vue: Loading user data on mount')
    await userStore.fetchUserData()
  } else {
    console.log('🔄 App.vue: Skipping user data load:', {
      isAuthenticated: authStore.isAuthenticated,
      hasUserData: !!userStore.userData,
      isLoading: userStore.loading
    })
  }
})

const menuItems = [
  { path: '/', label: 'home' },
  { path: '/pets', label: 'pets' },
  { path: '/friends', label: 'friends' },
  { path: '/messages', label: 'messages' },
  { path: '/profile', label: 'profile' }
]

const userMenuItems = computed(() => {
  const items = [
    { path: '/profile', label: 'my_profile' },
    { path: '/settings', label: 'settings' },
    { path: '/help', label: 'help' }
  ]

  // Добавляем "My Pets" только для пользователей с ролью user
  if (userStore.userData?.role === 'user') {
    items.splice(1, 0, { path: '/my-pets', label: 'my_pets' })
  }

  return items
})

const handleLogout = async () => {
  const confirmed = await confirmDialogRef.value.show({
    title: t('UI.confirm_dialog.logout.title'),
    message: t('UI.confirm_dialog.logout.message')
  })

  if (confirmed) {
    try {
      await authStore.logout()
      isUserMenuOpen.value = false
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

const getAvatarUrl = computed(() => userStore.getAvatarUrl)

</script>
