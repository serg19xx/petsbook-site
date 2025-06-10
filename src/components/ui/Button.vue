<template>
  <button
    :type="type"
    :class="[
      'btn',
      `btn-${severity}`,
      size ? `btn-${size}` : '',
      { 'btn-icon': icon || $slots.icon },
      { 'btn-raised': raised },
      { 'btn-rounded': rounded },
      { 'btn-text': text },
      { 'btn-outlined': outlined },
      { 'btn-fluid': fluid },
      className,
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="animate-spin mr-2">
      <Icon icon="mdi:loading" class="w-5 h-5" />
    </span>

    <!-- Left Icon -->
    <Icon v-else-if="icon" :icon="icon" class="w-5 h-5 mr-2" />
    <slot name="icon" v-else />

    <!-- Button Text -->
    <span v-if="label">{{ $t(label) }}</span>
    <slot v-else />

    <!-- Right Icon -->
    <slot name="rightIcon" />
  </button>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'success', 'info', 'warn', 'help', 'danger', 'contrast'].includes(
        value,
      ),
  },
  size: {
    type: String,
    default: '',
    validator: (value) => ['', 'sm', 'lg'].includes(value),
  },
  icon: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  raised: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: Boolean,
    default: false,
  },
  text: {
    type: Boolean,
    default: false,
  },
  outlined: {
    type: Boolean,
    default: false,
  },
  fluid: {
    type: Boolean,
    default: false,
  },
  align: {
    type: String,
    default: '',
    validator: (value) => ['', 'left', 'center', 'right'].includes(value),
  },
  className: {
    type: String,
    default: '',
  },
})

const containerClass = computed(() => {
  if (props.fluid) return 'w-full'
  return ''
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-danger {
  @apply text-white bg-red-600 hover:bg-red-700 focus:ring-red-500;
}

.btn-primary {
  @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500;
}

/* ... другие стили severity ... */
</style>
