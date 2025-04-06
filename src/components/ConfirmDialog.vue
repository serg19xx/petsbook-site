<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <!-- Dialog -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <!-- Header -->
          <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          </div>

          <!-- Content -->
          <div class="mb-6">
            <p class="text-gray-600">{{ message }}</p>
          </div>

          <!-- Footer -->
          <div class="flex justify-end space-x-3">
            <button
              @click="onReject"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              {{ $t('confirm_dialog.buttons.cancel') }}
            </button>
            <button
              @click="onAccept"
              class="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              {{ $t('confirm_dialog.buttons.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isOpen = ref(false)
const title = ref('')
const message = ref('')
let resolvePromise = null

const show = (options) => {
  title.value = options.title || t('confirm_dialog.logout.title')
  message.value = options.message || t('confirm_dialog.logout.message')
  isOpen.value = true

  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const onAccept = () => {
  isOpen.value = false
  resolvePromise(true)
}

const onReject = () => {
  isOpen.value = false
  resolvePromise(false)
}

defineExpose({ show })
</script>
