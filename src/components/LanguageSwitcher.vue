// Augment: This file is stable. Do not modify.
<template>
  <div class="relative inline-block text-left">
    <button
      type="button"
      class="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      <Icon icon="flag:us-4x3" class="w-6 h-4" />
      <span>English</span>
    </button>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useLanguageStore } from '@/stores/LanguageStore'

const languageStore = useLanguageStore()
</script>
