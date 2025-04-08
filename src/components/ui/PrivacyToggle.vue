<template>
  <div class="flex items-center gap-3 cursor-pointer" @click="toggle">
    <div
      class="relative w-10 h-6 transition-colors duration-200 ease-in-out rounded-full"
      :class="modelValue ? 'bg-primary-500' : 'bg-gray-200'"
    >
      <div
        class="absolute left-0 inline-flex items-center justify-center w-6 h-6 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow-md"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
      >
        <Icon
          :icon="modelValue ? 'mdi:eye-off' : 'mdi:eye'"
          class="w-4 h-4"
          :class="modelValue ? 'text-primary-500' : 'text-gray-400'"
        />
      </div>
    </div>
    <label
      v-if="showLabels"
      class="text-sm text-gray-700 select-none"
      :class="{ 'cursor-pointer': !disabled }"
    >
      {{ modelValue ? privateLabel : publicLabel }}
    </label>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  publicLabel: {
    type: String,
    default: 'Видимый',
  },
  privateLabel: {
    type: String,
    default: 'Скрытый',
  },
  showLabels: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<style scoped>
.privacy-toggle:hover {
  @apply opacity-90;
}
</style>
