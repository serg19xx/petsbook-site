<template>
  <MainLayout>
    <template #default>
      <div class="max-w-4xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="flex items-center gap-2 text-gray-600">
            <Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
            Loading pet information...
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800">
            <Icon icon="mdi:alert-circle" class="w-5 h-5" />
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Pet Detail Content -->
        <div v-else-if="pet" class="space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ pet.name }}</h1>
              <p class="text-lg text-gray-600">{{ pet.breed }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="handleLike"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  pet.isLiked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
              >
                <Icon :icon="pet.isLiked ? 'mdi:heart' : 'mdi:heart-outline'" class="w-5 h-5" />
                <span>{{ pet.likes }}</span>
              </button>
            </div>
          </div>

          <!-- Photo Gallery -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(photo, index) in pet.photos"
                :key="index"
                class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                @click="openPhotoGallery(index)"
              >
                <img
                  :src="photo"
                  :alt="`${pet.name} photo ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <!-- Pet Information -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Pet Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-medium text-gray-900 mb-2">Basic Information</h3>
                <dl class="space-y-2">
                  <div class="flex justify-between">
                    <dt class="text-gray-600">Species:</dt>
                    <dd class="font-medium">{{ pet.species }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">Breed:</dt>
                    <dd class="font-medium">{{ pet.breed }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">Gender:</dt>
                    <dd class="font-medium">{{ pet.gender === 'Boy' ? 'Male' : 'Female' }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">Age:</dt>
                    <dd class="font-medium">{{ pet.age }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">Color:</dt>
                    <dd class="font-medium">{{ pet.color || 'Not specified' }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">Size:</dt>
                    <dd class="font-medium">{{ pet.size || 'Not specified' }}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 class="font-medium text-gray-900 mb-2">Owner</h3>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    :src="pet.owner.avatar"
                    :alt="pet.owner.name"
                    class="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p class="font-medium text-gray-900">{{ pet.owner.name }}</p>
                    <p class="text-sm text-gray-600">{{ pet.location }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Comments ({{ pet.comments }})</h2>

            <!-- Comment Form (for logged in users) -->
            <div v-if="isLoggedIn" class="mb-6">
              <textarea
                v-model="newComment"
                rows="3"
                placeholder="Write a comment..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="addComment"
                  :disabled="!newComment.trim()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  Add comment
                </button>
              </div>
            </div>

            <!-- Comments List -->
            <div class="space-y-4">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="flex gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <img
                  :src="comment.author.avatar"
                  :alt="comment.author.name"
                  class="w-8 h-8 rounded-full"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-900">{{ comment.author.name }}</span>
                    <span class="text-xs text-gray-500">{{ comment.date }}</span>
                  </div>
                  <p class="text-gray-700">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { toast } from 'vue3-toastify'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()

// State
const pet = ref(null)
const loading = ref(true)
const error = ref(null)
const newComment = ref('')
const comments = ref([])

// Computed
const isLoggedIn = computed(() => {
  // TODO: Get from auth store
  return false
})

// Methods
async function loadPet() {
  loading.value = true
  error.value = null

  try {
    // TODO: Replace with actual API call
    const response = await fetchPet(route.params.id)
    pet.value = response
  } catch (err) {
    error.value = 'Error loading pet information'
    console.error('Error loading pet:', err)
  } finally {
    loading.value = false
  }
}

async function fetchPet(id) {
  // TODO: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    id: parseInt(id),
    name: 'Whisky',
    species: 'Cat',
    breed: 'Bengal',
    gender: 'Boy',
    age: '2 years',
    color: 'Orange',
    size: 'Medium',
    location: 'Moscow',
    photos: [
      'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Photo+1',
      'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Photo+2',
      'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Photo+3',
      'https://via.placeholder.com/400x300/96CEB4/FFFFFF?text=Photo+4',
    ],
    likes: 42,
    comments: 8,
    isLiked: false,
    owner: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=JD',
    },
  }
}

function handleLike() {
  if (!isLoggedIn.value) {
    toast.error('Please log in to like pets')
    return
  }

  // TODO: Implement like logic
  pet.value.isLiked = !pet.value.isLiked
  pet.value.likes += pet.value.isLiked ? 1 : -1
  toast.success(pet.value.isLiked ? 'Like added!' : 'Like removed!')
}

function openPhotoGallery(index) {
  // TODO: Implement photo gallery modal
  console.log('Open photo gallery at index:', index)
}

function addComment() {
  if (!newComment.value.trim()) return

  // TODO: Implement comment logic
  const comment = {
    id: Date.now(),
    text: newComment.value,
    author: {
      name: 'Current User',
      avatar: 'https://via.placeholder.com/32x32/4ECDC4/FFFFFF?text=U',
    },
    date: new Date().toLocaleDateString(),
  }

  comments.value.unshift(comment)
  pet.value.comments++
  newComment.value = ''
  toast.success('Comment added!')
}

// Lifecycle
onMounted(() => {
  loadPet()
})
</script>
