<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ $t(label) }}
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        :disabled="disabled"
        v-maska
        :data-maska="mask"
        :class="['input-base', { 'input-error': error }, { 'input-disabled': disabled }, className]"
      />
      <slot name="icon-right" />
    </div>
    <div v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</div>
    <div v-if="hint" class="text-gray-500 text-sm mt-1">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { vMaska as maska } from 'maska'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
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
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  },
  className: {
    type: String,
    default: '',
  },
  mask: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

onMounted(() => {
  console.log('Input label:', props.label)
  console.log('Input label type:', typeof props.label)
})
</script>

<style scoped>
.input-base {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500;
}

.input-error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.input-disabled {
  @apply bg-gray-100 cursor-not-allowed;
}
</style>
