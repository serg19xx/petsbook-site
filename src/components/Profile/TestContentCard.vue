<template>
  <div class="bg-white border-b">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
          <img
            src="https://placehold.co/100x100"
            alt="Author avatar"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <div class="font-medium text-gray-900">John Smith</div>
          <div class="text-sm text-gray-500">2 часа назад</div>
        </div>
        <button class="ml-auto text-gray-400 hover:text-gray-600">
          <Icon icon="mdi:dots-horizontal" class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        <p class="text-gray-800">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p class="text-gray-800">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
      </div>

      <!-- Image -->
      <div class="mt-4 -mx-4">
        <img
          src="https://placehold.co/800x400"
          alt="Post image"
          class="w-full h-[400px] object-cover"
        />
      </div>

      <!-- Interaction Bar -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t">
        <div class="flex space-x-4">
          <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <Icon icon="mdi:heart-outline" class="w-6 h-6" />
            <span>123</span>
          </button>
          <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <Icon icon="mdi:comment-outline" class="w-6 h-6" />
            <span>45</span>
          </button>
          <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <Icon icon="mdi:share-outline" class="w-6 h-6" />
            <span>12</span>
          </button>
        </div>
        <button class="text-gray-600 hover:text-gray-800">
          <Icon icon="mdi:bookmark-outline" class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>
