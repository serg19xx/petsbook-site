<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">
      {{ $t('UI.media.title') }}
    </h3>

    <!-- Current Media Display -->
    <div v-if="currentMedia.length > 0" class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700">
        {{ $t('UI.media.current_media') }}
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="media in currentMedia" :key="media.id" class="relative group">
          <img :src="media.url" :alt="media.name" class="w-full h-24 object-cover rounded-lg" />
          <button
            @click="removeMedia(media.id)"
            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon icon="mdi:close" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Options -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700">
        {{ $t('UI.media.add_media') }}
      </h4>

      <!-- Local Upload -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon icon="mdi:upload" class="w-5 h-5 text-gray-500" />
            <div>
              <p class="text-sm font-medium text-gray-700">
                {{ $t('UI.media.local_upload') }}
              </p>
              <p class="text-xs text-gray-500">
                {{ $t('UI.media.local_description') }}
              </p>
            </div>
          </div>
          <button
            @click="triggerLocalUpload"
            class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            {{ $t('UI.media.select_files') }}
          </button>
        </div>
        <input
          ref="localInput"
          type="file"
          multiple
          accept="image/*"
          @change="handleLocalUpload"
          class="hidden"
        />
      </div>

      <!-- Cloud Upload -->
      <div
        class="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-400 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon icon="mdi:cloud-upload" class="w-5 h-5 text-blue-500" />
            <div>
              <p class="text-sm font-medium text-blue-700">
                {{ $t('UI.media.cloud_upload') }}
              </p>
              <p class="text-xs text-blue-500">
                {{ $t('UI.media.cloud_description') }}
              </p>
            </div>
          </div>
          <button
            @click="triggerCloudUpload"
            class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            {{ $t('UI.media.select_files') }}
          </button>
        </div>
        <input
          ref="cloudInput"
          type="file"
          multiple
          accept="image/*"
          @change="handleCloudUpload"
          class="hidden"
        />
      </div>

      <!-- Social Media Import -->
      <div class="space-y-2">
        <h5 class="text-sm font-medium text-gray-700">
          {{ $t('UI.media.social_import') }}
        </h5>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="importFromInstagram"
            class="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600"
          >
            <Icon icon="mdi:instagram" class="w-4 h-4" />
            {{ $t('UI.media.instagram') }}
          </button>
          <button
            @click="importFromFacebook"
            class="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Icon icon="mdi:facebook" class="w-4 h-4" />
            {{ $t('UI.media.facebook') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Coming Soon Notice -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:information" class="w-5 h-5 text-yellow-600" />
        <div>
          <p class="text-sm font-medium text-yellow-800">
            {{ $t('UI.media.coming_soon_title') }}
          </p>
          <p class="text-xs text-yellow-700 mt-1">
            {{ $t('UI.media.coming_soon_description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  currentMedia: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['add-media', 'remove-media'])

// Refs
const localInput = ref(null)
const cloudInput = ref(null)

// Methods
function triggerLocalUpload() {
  localInput.value?.click()
}

function triggerCloudUpload() {
  cloudInput.value?.click()
}

function handleLocalUpload(event) {
  const files = Array.from(event.target.files)
  emit(
    'add-media',
    files.map((file) => ({
      file,
      type: 'local',
      name: file.name,
    })),
  )
}

function handleCloudUpload(event) {
  const files = Array.from(event.target.files)
  emit(
    'add-media',
    files.map((file) => ({
      file,
      type: 'cloud',
      name: file.name,
    })),
  )
}

function removeMedia(mediaId) {
  emit('remove-media', mediaId)
}

function importFromInstagram() {
  // TODO: Implement Instagram import
  console.log('Instagram import - coming soon')
}

function importFromFacebook() {
  // TODO: Implement Facebook import
  console.log('Facebook import - coming soon')
}
</script>
