// Augment: This file is stable. Do not modify.
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content Container -->
    <div class="container mx-auto px-4 py-4">
      <div class="grid grid-cols-12 gap-6">
        <aside class="col-span-3 hidden lg:block">
          <slot name="left-sidebar"></slot>
        </aside>

        <main class="col-span-12 lg:col-span-6">
          <slot></slot>
        </main>

        <aside class="col-span-3 hidden lg:block">
          <slot name="right-sidebar"></slot>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  showBannerScroll: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:showBannerScroll'])

onMounted(() => {
  emit('update:showBannerScroll', props.showBannerScroll)
})
</script>