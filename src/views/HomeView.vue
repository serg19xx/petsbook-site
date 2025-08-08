<template>
  <MainLayout>
    <!-- Left Sidebar Content -->
    <template #left-sidebar>

    </template>

    <!-- Main Content -->
    <template #default>
      <div class="space-y-4">
        <!-- Create Post -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-full bg-gray-200"></div>
            <div class="flex-1">
              <input
                type="text"
                placeholder="Что у вас нового?"
                class="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <!-- Posts Feed -->
        <div class="space-y-4">
          <div v-for="post in posts" :key="post.id" class="bg-white rounded-lg shadow">
            <div class="p-4 flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-gray-200">
                <img
                  :src="post.authorAvatar"
                  alt=""
                  class="w-full h-full rounded-full object-cover"
                />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold">{{ post.authorName }}</h4>
                <div class="text-sm text-gray-500">{{ post.timestamp }}</div>
              </div>
            </div>
            <div class="px-4 pb-4">
              <p class="text-gray-800">{{ post.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Right Sidebar Content -->
    <template #right-sidebar>

    </template>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { Icon } from '@iconify/vue'

const posts = ref([
  {
    id: 1,
    authorName: 'Иван Петров',
    authorAvatar: 'https://placehold.co/100x100',
    timestamp: '2 часа назад',
    content: 'Отличный день для прогулки с собакой! ',
  },
  {
    id: 2,
    authorName: 'Мария Сидорова',
    authorAvatar: 'https://placehold.co/100x100',
    timestamp: '4 часа назад',
    content: 'Мой кот сегодня научился новому трюку! ',
  },
])
</script>
