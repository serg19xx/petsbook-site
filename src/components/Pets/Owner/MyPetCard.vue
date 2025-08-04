<template>
  <div
    class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
  >
    <!-- Pet Photo -->
    <div class="relative h-48 bg-gray-100">
      <img v-if="pet.photo" :src="pet.photo" :alt="pet.name" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon icon="mdi:paw" class="w-12 h-12 text-gray-400" />
      </div>

      <!-- Owner Action Buttons -->
      <div class="absolute top-2 right-2 flex gap-1">
        <button
          @click="$emit('edit', pet)"
          class="bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors"
          :title="$t('UI.pets.owner.actions.edit')"
        >
          <Icon icon="mdi:pencil" class="w-4 h-4 text-gray-600" />
        </button>
        <button
          @click="$emit('delete', pet)"
          class="bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors"
          :title="$t('UI.pets.owner.actions.delete')"
        >
          <Icon icon="mdi:delete" class="w-4 h-4 text-red-600" />
        </button>
      </div>

      <!-- Status Badge -->
      <div class="absolute top-2 left-2">
        <span
          :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            pet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
          ]"
        >
          {{ $t(`UI.pets.status.${pet.status || 'active'}`) }}
        </span>
      </div>
    </div>

    <!-- Pet Info -->
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ pet.name }}
        </h3>
        <span class="text-xs text-gray-500">#{{ pet.id }}</span>
      </div>

      <div class="space-y-2 text-sm text-gray-600">
        <!-- Type and Breed -->
        <div class="flex items-center gap-2">
          <Icon icon="mdi:tag" class="w-4 h-4" />
          <span>{{ $t(`UI.pets.types.${pet.type}`) }}</span>
          <span v-if="pet.breed" class="text-gray-400">•</span>
          <span v-if="pet.breed">{{ pet.breed }}</span>
        </div>

        <!-- Age -->
        <div v-if="pet.age" class="flex items-center gap-2">
          <Icon icon="mdi:cake-variant" class="w-4 h-4" />
          <span>{{ pet.age }} {{ $t('UI.pets.years') }}</span>
        </div>

        <!-- Weight -->
        <div v-if="pet.weight" class="flex items-center gap-2">
          <Icon icon="mdi:scale" class="w-4 h-4" />
          <span>{{ pet.weight }} {{ $t('UI.pets.weight_unit') }}</span>
        </div>

        <!-- Color -->
        <div v-if="pet.color" class="flex items-center gap-2">
          <Icon icon="mdi:palette" class="w-4 h-4" />
          <span>{{ pet.color }}</span>
        </div>

        <!-- Microchip -->
        <div v-if="pet.microchip" class="flex items-center gap-2">
          <Icon icon="mdi:chip" class="w-4 h-4" />
          <span class="text-xs">{{ pet.microchip }}</span>
        </div>
      </div>

      <!-- Owner Actions Footer -->
      <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div class="flex gap-2">
          <button
            @click="$emit('view', pet)"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {{ $t('UI.pets.owner.actions.view') }}
          </button>
          <button
            @click="$emit('share', pet)"
            class="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            {{ $t('UI.pets.owner.actions.share') }}
          </button>
        </div>

        <div class="text-xs text-gray-500">
          {{ $t('UI.pets.owner.last_updated') }}: {{ formatDate(pet.updatedAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  pet: {
    type: Object,
    required: true,
  },
})

// Emits
defineEmits(['edit', 'delete', 'view', 'share'])

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>
