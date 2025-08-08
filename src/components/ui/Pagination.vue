<template>
  <div class="flex items-center justify-center gap-2">
    <!-- Previous Button -->
    <button
      @click="handlePageChange(currentPage - 1)"
      :disabled="currentPage <= 1"
      :class="[
        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
        currentPage <= 1
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
      ]"
    >
      <Icon icon="mdi:chevron-left" class="w-4 h-4" />
    </button>

    <!-- Page Numbers -->
    <div class="flex items-center gap-1">
      <!-- First Page -->
      <button
        v-if="showFirstPage"
        @click="handlePageChange(1)"
        :class="[
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          currentPage === 1
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        ]"
      >
        1
      </button>

      <!-- Ellipsis -->
      <span v-if="showFirstEllipsis" class="px-2 text-gray-400">...</span>

      <!-- Middle Pages -->
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="handlePageChange(page)"
        :class="[
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          currentPage === page
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        ]"
      >
        {{ page }}
      </button>

      <!-- Ellipsis -->
      <span v-if="showLastEllipsis" class="px-2 text-gray-400">...</span>

      <!-- Last Page -->
      <button
        v-if="showLastPage"
        @click="handlePageChange(totalPages)"
        :class="[
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          currentPage === totalPages
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        ]"
      >
        {{ totalPages }}
      </button>
    </div>

    <!-- Next Button -->
    <button
      @click="handlePageChange(currentPage + 1)"
      :disabled="currentPage >= totalPages"
      :class="[
        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
        currentPage >= totalPages
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
      ]"
    >
      <Icon icon="mdi:chevron-right" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['page-change'])

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const showFirstPage = computed(() => {
  return props.currentPage > 3
})

const showLastPage = computed(() => {
  return props.currentPage < totalPages.value - 2
})

const showFirstEllipsis = computed(() => {
  return props.currentPage > 4
})

const showLastEllipsis = computed(() => {
  return props.currentPage < totalPages.value - 3
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(2, props.currentPage - 1)
  const end = Math.min(totalPages.value - 1, props.currentPage + 1)

  for (let i = start; i <= end; i++) {
    if (i > 1 && i < totalPages.value) {
      pages.push(i)
    }
  }

  return pages
})

// Methods
function handlePageChange(page) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script> 