<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ $t(label) }}
    </label>
    <select
      :id="id"
      :value="modelValue"
      @input="handleInput"
      :disabled="disabled"
      :class="['select-base', { 'select-error': error }, { 'select-disabled': disabled }]"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</div>
    <div v-if="hint" class="text-gray-500 text-sm mt-1">{{ hint }}</div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: [String, Function],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substr(2, 9)}`,
  },
  className: {
    type: String,
    default: '',
  },
})

onMounted(() => {
  console.log('Select component mounted')
  console.log('Label:', props.label)
  console.log('Label type:', typeof props.label)
  console.log('Options:', props.options)
  console.log('Select label:', props.label)
  console.log('Select label type:', typeof props.label)
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.select-base {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500;
}

.select-error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.select-disabled {
  @apply bg-gray-100 cursor-not-allowed;
}
</style>
