<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

    <!-- Dialog -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md bg-white rounded-lg shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
          <button @click="handleCancel" class="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon icon="mdi:close" class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <Icon :icon="icon" :class="['w-6 h-6', iconClass]" />
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-600">
                {{ message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleConfirm"
            :class="[
              'px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md',
              confirmButtonClass,
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'mdi:alert-circle',
  },
  iconClass: {
    type: String,
    default: 'text-yellow-500',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  type: {
    type: String,
    default: 'warning', // warning, danger, info
    validator: (value) => ['warning', 'danger', 'info'].includes(value),
  },
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// Computed
const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700'
    case 'info':
      return 'bg-blue-600 hover:bg-blue-700'
    default:
      return 'bg-yellow-600 hover:bg-yellow-700'
  }
})

// Methods
function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>
