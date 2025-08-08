<template>
  <div
    class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
  >
    <!-- Photo Carousel -->
    <div class="relative aspect-square bg-gray-100 overflow-hidden">
      <div class="relative w-full h-full">
        <img
          :src="currentPhoto"
          :alt="`${pet.name} photo`"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          @click="openPhotoViewer"
        />

        <!-- Top Overlay - Pet Name -->
        <div
          class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3"
        >
          <h3 class="text-white font-semibold text-lg">{{ pet.name }}</h3>
        </div>

        <!-- Bottom Overlay - Breed -->
        <div
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3"
        >
          <p class="text-white font-medium">{{ pet.breed }}</p>
        </div>

        <!-- Navigation Arrows (only on hover) -->
        <button
          v-if="pet.photos.length > 1"
          @click.stop="previousPhoto"
          class="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Icon icon="mdi:chevron-left" class="w-6 h-6" />
        </button>
        <button
          v-if="pet.photos.length > 1"
          @click.stop="nextPhoto"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Icon icon="mdi:chevron-right" class="w-6 h-6" />
        </button>

        <!-- Floating Like Button -->
        <button
          @click.stop="handleLike"
          :class="[
            'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg',
            pet.isLiked
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500',
          ]"
        >
          <Icon :icon="pet.isLiked ? 'mdi:heart' : 'mdi:heart-outline'" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Bottom Actions Bar -->
    <div class="flex items-center justify-between p-3 bg-white">
      <!-- Stats (non-clickable) -->
      <div class="flex items-center gap-4 text-sm text-gray-600">
        <div class="flex items-center gap-1">
          <Icon icon="mdi:heart" class="w-4 h-4 text-red-500" />
          <span class="font-medium">{{ pet.likes }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="mdi:comment" class="w-4 h-4 text-blue-500" />
          <span class="font-medium">{{ pet.comments }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <!-- Comments Button -->
        <button
          @click="handleComment"
          class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="View comments"
        >
          <Icon icon="mdi:comment-text" class="w-5 h-5" />
        </button>

        <!-- View Details Icon -->
        <button
          @click="handleView"
          class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="View details"
        >
          <Icon icon="mdi:eye" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Photo Viewer -->
    <PetPhotoViewer
      :is-open="showPhotoViewer"
      :pet="pet"
      :initial-photo-index="currentPhotoIndex"
      @close="showPhotoViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import PetPhotoViewer from './PetPhotoViewer.vue'

// Props
const props = defineProps({
  pet: {
    type: Object,
    required: true,
  },
})

// Emits
const emit = defineEmits(['like', 'comment', 'view'])

// State
const currentPhotoIndex = ref(0)
const showPhotoViewer = ref(false)

// Computed
const currentPhoto = computed(() => {
  return props.pet.photos[currentPhotoIndex.value] || props.pet.photos[0]
})

// Methods
function handleLike() {
  emit('like', props.pet.id)
}

function handleComment() {
  emit('comment', props.pet)
}

function handleView() {
  emit('view', props.pet)
}

function openPhotoViewer() {
  showPhotoViewer.value = true
}

function nextPhoto() {
  if (currentPhotoIndex.value < props.pet.photos.length - 1) {
    currentPhotoIndex.value++
  } else {
    currentPhotoIndex.value = 0
  }
}

function previousPhoto() {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--
  } else {
    currentPhotoIndex.value = props.pet.photos.length - 1
  }
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
