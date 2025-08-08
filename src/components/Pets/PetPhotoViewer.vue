<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    @click="handleBackdropClick"
  >
    <!-- Photo Viewer Container -->
    <div class="relative w-full h-full flex items-center justify-center p-4">
      <!-- Main Photo -->
      <div class="relative max-w-4xl max-h-full">
        <img
          :src="currentPhoto"
          :alt="`${pet?.name} photo ${currentIndex + 1}`"
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />

        <!-- Photo Counter -->
        <div
          class="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium"
        >
          {{ currentIndex + 1 }} / {{ pet?.photos?.length || 0 }}
        </div>

        <!-- Navigation Arrows -->
        <button
          v-if="pet?.photos?.length > 1"
          @click="previousPhoto"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200"
        >
          <Icon icon="mdi:chevron-left" class="w-6 h-6" />
        </button>
        <button
          v-if="pet?.photos?.length > 1"
          @click="nextPhoto"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200"
        >
          <Icon icon="mdi:chevron-right" class="w-6 h-6" />
        </button>

        <!-- Action Buttons -->
        <div class="absolute top-4 right-4 flex gap-2">
          <!-- Fullscreen Button -->
          <button
            @click="toggleFullscreen"
            class="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200"
            :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
          >
            <Icon :icon="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" class="w-5 h-5" />
          </button>

          <!-- Close Button -->
          <button
            @click="close"
            class="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200"
            title="Close"
          >
            <Icon icon="mdi:close" class="w-5 h-5" />
          </button>
        </div>

        <!-- Thumbnails (only in non-fullscreen mode) -->
        <div
          v-if="!isFullscreen && pet?.photos?.length > 1"
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2"
        >
          <button
            v-for="(photo, index) in pet.photos"
            :key="index"
            @click="currentIndex = index"
            :class="[
              'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
              index === currentIndex ? 'border-white' : 'border-white/30 hover:border-white/60',
            ]"
          >
            <img :src="photo" :alt="`Thumbnail ${index + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </div>

    <!-- Keyboard Navigation Hints -->
    <div class="absolute bottom-4 left-4 text-white/60 text-sm">
      <div class="flex items-center gap-4">
        <span>← → Navigate</span>
        <span>F Fullscreen</span>
        <span>ESC Close</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  pet: {
    type: Object,
    required: true,
  },
  initialPhotoIndex: {
    type: Number,
    default: 0,
  },
})

// Emits
const emit = defineEmits(['close'])

// State
const currentIndex = ref(props.initialPhotoIndex)
const isFullscreen = ref(false)

// Computed
const currentPhoto = computed(() => {
  return props.pet?.photos?.[currentIndex.value] || ''
})

// Methods
function close() {
  emit('close')
}

function handleBackdropClick(event) {
  if (event.target === event.currentTarget) {
    close()
  }
}

function nextPhoto() {
  if (props.pet?.photos?.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % props.pet.photos.length
  }
}

function previousPhoto() {
  if (props.pet?.photos?.length > 1) {
    currentIndex.value =
      currentIndex.value === 0 ? props.pet.photos.length - 1 : currentIndex.value - 1
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function handleKeydown(event) {
  if (!props.isOpen) return

  switch (event.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      previousPhoto()
      break
    case 'ArrowRight':
      nextPhoto()
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', () => {})
})

// Watch for prop changes
watch(
  () => props.initialPhotoIndex,
  (newIndex) => {
    currentIndex.value = newIndex
  },
)
</script>
