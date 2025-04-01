<template>
  <MainLayout>
    <template #main>
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b">
          <h2 class="text-xl font-semibold">Сообщения</h2>
        </div>
        <div class="p-4">
          <p class="text-gray-600">Здесь будет список сообщений</p>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
</script>
