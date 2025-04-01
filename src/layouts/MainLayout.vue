// Augment: This file is stable. Do not modify.
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Banner Scroll Section -->
    <div class="bg-white shadow-sm border-b fixed top-[125px] w-full z-30">
      <div class="container mx-auto px-4">
        <div class="py-2 relative overflow-hidden">
          <div class="banner-scroll flex items-center space-x-6 py-1.5">
            <div
              v-for="banner in banners"
              :key="banner.id"
              :class="[
                banner.bgColor,
                'flex-shrink-0 px-3 py-2 md:px-4 md:py-2.5 rounded-lg cursor-pointer transition-transform hover:scale-105',
              ]"
              @click="navigateToBanner(banner)"
            >
              <div class="flex items-center space-x-2">
                <Icon :icon="banner.icon" :class="[banner.color, 'w-4 h-4 md:w-5 md:h-5']" />
                <span class="text-xs md:text-sm text-gray-700">{{ banner.text }}</span>
              </div>
            </div>
            <!-- Дублированные баннеры -->
            <div
              v-for="banner in banners"
              :key="'duplicate-' + banner.id"
              :class="[
                banner.bgColor,
                'flex-shrink-0 px-3 py-2 md:px-4 md:py-2.5 rounded-lg cursor-pointer transition-transform hover:scale-105',
              ]"
              @click="navigateToBanner(banner)"
            >
              <div class="flex items-center space-x-2">
                <Icon :icon="banner.icon" :class="[banner.color, 'w-4 h-4 md:w-5 md:h-5']" />
                <span class="text-xs md:text-sm text-gray-700">{{ banner.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="container mx-auto px-4 py-4 mt-[60px] md:mt-[70px]">
      <div class="grid grid-cols-12 gap-6">
        <aside class="col-span-3 hidden lg:block">
          <slot name="left-sidebar"></slot>
        </aside>

        <main class="col-span-12 lg:col-span-6">
          <slot></slot>
        </main>

        <aside class="col-span-3 hidden lg:block">
          <slot name="right-sidebar"></slot>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getActiveBanners } from '@/api/bannerData'

const router = useRouter()
const banners = ref([])

onMounted(async () => {
  try {
    banners.value = await getActiveBanners()
    console.log('Loaded banners:', banners.value) // Для отладки
  } catch (error) {
    console.error('Error loading banners:', error)
  }
})

const navigateToBanner = (banner) => {
  if (banner.link) {
    router.push(banner.link)
  }
}
</script>

<style scoped>
.banner-scroll {
  animation: scrollBanner 40s linear infinite;
  will-change: transform;
  display: flex;
  align-items: center;
  min-height: 44px; /* Увеличили минимальную высоту */
}

@keyframes scrollBanner {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.banner-scroll:hover {
  animation-play-state: paused;
}

.overflow-hidden {
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
}
</style>
