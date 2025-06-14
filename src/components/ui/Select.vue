<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ $t(label) }}
    </label>
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        @input="handleInput"
        :disabled="disabled"
        :class="['select-base', { 'select-error': error }, { 'select-disabled': disabled }]"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
      <span class="select-arrow"></span>
    </div>
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
  appearance: none;
  line-height: 1.5rem;
  min-height: 40px;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: white;
}

.select-arrow {
  pointer-events: none;
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-arrow::after {
  content: '';
  display: block;
  width: 0.7em;
  height: 0.7em;
  border-right: 2px solid #6b7280; /* gray-500 */
  border-bottom: 2px solid #6b7280;
  transform: rotate(45deg);
  margin-top: 0.2em;
}

.select-error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.select-disabled {
  @apply bg-gray-100 cursor-not-allowed;
}
</style>
