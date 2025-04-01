<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :class="[
        'textarea-base',
        { 'textarea-error': error },
        { 'textarea-disabled': disabled },
        className,
      ]"
    ></textarea>
    <div v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</div>
    <div v-if="hint" class="text-gray-500 text-sm mt-1">{{ hint }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 3,
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
    default: () => `textarea-${Math.random().toString(36).substr(2, 9)}`,
  },
  className: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>
