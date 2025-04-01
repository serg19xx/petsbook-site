<template>
  <div
    :class="[
      containerClass,
      { 'flex justify-end': align === 'right' },
      { 'flex justify-center': align === 'center' },
    ]"
  >
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
      <span v-if="label">{{ label }}</span>
      <slot v-else />

      <!-- Right Icon -->
      <slot name="rightIcon" />
    </button>
  </div>
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
