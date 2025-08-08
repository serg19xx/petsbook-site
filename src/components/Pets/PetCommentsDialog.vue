<template>
  <Dialog
    :model-value="isOpen"
    @close="$emit('close')"
    :title="`Comments for ${pet?.name}`"
    size="lg"
  >
    <div class="space-y-6">
      <!-- Comment Form (for logged in users) -->
      <div v-if="isLoggedIn" class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <img :src="currentUserAvatar" :alt="currentUserName" class="w-10 h-10 rounded-full" />
          <div class="flex-1">
            <textarea
              v-model="newComment"
              rows="3"
              placeholder="Write a comment..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
            <div class="flex justify-end mt-2">
              <button
                @click="addComment"
                :disabled="!newComment.trim()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
              >
                Post comment
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments List -->
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div v-if="loading" class="flex justify-center py-8">
          <div class="flex items-center gap-2 text-gray-600">
            <Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
            Loading comments...
          </div>
        </div>

        <div v-else-if="comments.length === 0" class="text-center py-8">
          <Icon icon="mdi:comment-outline" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500">No comments yet</p>
          <p class="text-sm text-gray-400 mt-1">Be the first to comment!</p>
        </div>

        <div
          v-else
          v-for="comment in comments"
          :key="comment.id"
          class="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <img
            :src="comment.author.avatar"
            :alt="comment.author.name"
            class="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-gray-900">{{ comment.author.name }}</span>
              <span class="text-xs text-gray-500">{{ formatDate(comment.date) }}</span>
            </div>
            <p class="text-gray-700 leading-relaxed">{{ comment.text }}</p>

            <!-- Comment Actions -->
            <div class="flex items-center gap-4 mt-3 text-sm">
              <button
                @click="handleLikeComment(comment)"
                :class="[
                  'flex items-center gap-1 transition-colors',
                  comment.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600',
                ]"
              >
                <Icon :icon="comment.isLiked ? 'mdi:heart' : 'mdi:heart-outline'" class="w-4 h-4" />
                <span>{{ comment.likes || 0 }}</span>
              </button>

              <button
                @click="handleReply(comment)"
                class="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Icon icon="mdi:reply" class="w-4 h-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue3-toastify'
import Dialog from '@/components/ui/Dialog.vue'

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
})

// Emits
const emit = defineEmits(['close'])

// State
const comments = ref([])
const loading = ref(false)
const newComment = ref('')

// Computed
const isLoggedIn = computed(() => {
  // TODO: Get from auth store
  return false
})

const currentUserAvatar = computed(() => {
  // TODO: Get from auth store
  return 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=U'
})

const currentUserName = computed(() => {
  // TODO: Get from auth store
  return 'Current User'
})

// Methods
async function loadComments() {
  if (!props.pet) return

  loading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    comments.value = [
      {
        id: 1,
        text: 'What a beautiful pet! I love the photos.',
        author: {
          name: 'Sarah Johnson',
          avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=SJ',
        },
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 3,
        isLiked: false,
      },
      {
        id: 2,
        text: 'Such a cute little one! How old is it?',
        author: {
          name: 'Mike Wilson',
          avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=MW',
        },
        date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        likes: 1,
        isLiked: true,
      },
    ]
  } catch (error) {
    console.error('Error loading comments:', error)
    toast.error('Failed to load comments')
  } finally {
    loading.value = false
  }
}

function addComment() {
  if (!newComment.value.trim()) return

  const comment = {
    id: Date.now(),
    text: newComment.value,
    author: {
      name: currentUserName.value,
      avatar: currentUserAvatar.value,
    },
    date: new Date(),
    likes: 0,
    isLiked: false,
  }

  comments.value.unshift(comment)
  newComment.value = ''
  toast.success('Comment posted!')
}

function handleLikeComment(comment) {
  if (!isLoggedIn.value) {
    toast.error('Please log in to like comments')
    return
  }

  comment.isLiked = !comment.isLiked
  comment.likes += comment.isLiked ? 1 : -1
  toast.success(comment.isLiked ? 'Comment liked!' : 'Like removed!')
}

function handleReply(comment) {
  if (!isLoggedIn.value) {
    toast.error('Please log in to reply')
    return
  }

  // TODO: Implement reply functionality
  console.log('Reply to comment:', comment.id)
  toast.info('Reply functionality coming soon!')
}

function formatDate(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(date).toLocaleDateString()
}

// Watch for pet changes
watch(
  () => props.pet,
  () => {
    if (props.pet && props.isOpen) {
      loadComments()
    }
  },
  { immediate: true },
)

// Watch for dialog open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.pet) {
      loadComments()
    }
  },
)
</script>
