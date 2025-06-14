<template>
  <div class="bg-white shadow-sm border-b fixed w-full z-40" style="top: 122px">
    <div class="relative overflow-hidden">
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
  min-height: 44px;
  padding-left: 100%;
}

@keyframes scrollBanner {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-200%);
  }
}

.banner-scroll:hover {
  animation-play-state: paused;
}
</style>
