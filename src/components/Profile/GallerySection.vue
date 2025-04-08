<template>
  <!-- ... существующий код ... -->
  <button
    @click="handleEdit"
    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
  >
    Edit Gallery
  </button>
  <!-- ... -->
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleEdit = () => {
  router.push({ name: 'profile-edit-gallery' })
}
</script>
