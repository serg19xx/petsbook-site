<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="modelValue" class="dialog-wrapper">
        <!-- Overlay -->
        <div class="dialog-overlay" @click="close"></div>

        <!-- Dialog -->
        <div class="dialog-container">
          <div
            class="dialog-box"
            :class="{
              'w-full max-w-sm': size === 'sm',
              'w-full max-w-2xl': size === 'md',
              'w-full max-w-4xl': size === 'lg'
            }"
          >
            <!-- Header -->
            <div class="dialog-header">
              <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-500"
              >
                <Icon icon="mdi:close" class="w-6 h-6" />
              </button>
            </div>

            <!-- Content -->
            <div class="dialog-content">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div class="dialog-footer">
              <slot name="footer">
                <div class="flex justify-end space-x-3">
                  <button
                    @click="close"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {{ t('common.cancel') }}
                  </button>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const { t } = useI18n()

// Следим за изменениями modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      document.body.style.overflow = 'hidden'
    })
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.dialog-wrapper {
  @apply fixed inset-0 z-[9999] overflow-y-auto;
}

.dialog-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50;
}

.dialog-container {
  @apply flex min-h-full items-center justify-center p-4;
}

.dialog-box {
  @apply relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all;
}

.dialog-header {
  @apply flex items-center justify-between border-b px-4 py-3;
}

.dialog-content {
  @apply p-0;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-footer {
  @apply border-t px-4 py-3;
}

/* Убедимся, что диалог всегда поверх других элементов */
:deep(.dialog-content),
:deep(.dialog-header),
:deep(.dialog-footer) {
  position: relative;
  z-index: 10000;
}
</style>
