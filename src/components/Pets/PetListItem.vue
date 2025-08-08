<template>
  <div 
    class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4 group"
    @click="$emit('click', pet)"
  >
    <div class="flex items-center gap-4">
      <!-- Image -->
      <div class="relative w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden flex-shrink-0">
        <div v-if="pet.photo" class="w-full h-full">
          <img 
            :src="pet.photo" 
            :alt="pet.name"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div v-else class="w-full h-full flex items-center justify-center">
          <Icon :icon="getSpeciesIcon(pet.species)" class="w-8 h-8 text-blue-600" />
        </div>

        <!-- Status Badge -->
        <div class="absolute top-1 left-1">
          <span 
            :class="[
              'px-1 py-0.5 text-xs font-medium rounded-full',
              pet.published 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ pet.published ? $t('UI.pets.status.published') : $t('UI.pets.status.draft') }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
              {{ pet.name || $t('UI.pets.unnamed') }}
            </h3>
            <p class="text-sm text-gray-600 mb-2">
              {{ $t(`UI.pets.types.${pet.species}`) }} • {{ pet.breed || $t('UI.pets.unknown_breed') }}
            </p>

            <!-- Details -->
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <div v-if="pet.gender" class="flex items-center gap-1">
                <Icon 
                  :icon="pet.gender.toLowerCase() === 'boy' ? 'mdi:gender-male' : 'mdi:gender-female'" 
                  class="w-4 h-4" 
                />
                <span>{{ $t(`UI.pets.genders.${pet.gender.toLowerCase()}`) }}</span>
              </div>

              <div v-if="pet.color" class="flex items-center gap-1">
                <Icon icon="mdi:palette" class="w-4 h-4" />
                <span>{{ pet.color }}</span>
              </div>

              <div v-if="pet.pet_size" class="flex items-center gap-1">
                <Icon icon="mdi:ruler" class="w-4 h-4" />
                <span class="capitalize">{{ $t(`UI.pets.sizes.${pet.pet_size}`) }}</span>
              </div>

              <div v-if="pet.dob" class="flex items-center gap-1">
                <Icon icon="mdi:cake-variant" class="w-4 h-4" />
                <span>{{ formatDate(pet.dob) }}</span>
              </div>
            </div>
          </div>

          <!-- Owner Info -->
          <div v-if="pet.owner" class="flex items-center gap-2 ml-4">
            <img 
              v-if="pet.owner.avatar" 
              :src="pet.owner.avatar" 
              :alt="pet.owner.name"
              class="w-6 h-6 rounded-full"
            />
            <span class="text-sm text-gray-600">{{ pet.owner.name }}</span>
          </div>
        </div>

        <!-- Description -->
        <div v-if="pet.description" class="mt-2">
          <p class="text-sm text-gray-600 line-clamp-2">{{ pet.description }}</p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <div class="flex items-center gap-1">
              <Icon icon="mdi:calendar" class="w-3 h-3" />
              <span>{{ formatDate(pet.createdAt) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Icon icon="mdi:eye" class="w-3 h-3" />
              <span>{{ pet.views || 0 }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click.stop="$emit('view', pet)"
              class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              :title="$t('UI.pets.actions.view')"
            >
              <Icon icon="mdi:eye" class="w-4 h-4" />
            </button>
            <button 
              @click.stop="$emit('share', pet)"
              class="p-1 text-gray-400 hover:text-green-600 transition-colors"
              :title="$t('UI.pets.actions.share')"
            >
              <Icon icon="mdi:share" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  pet: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'view', 'share'])

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

function getSpeciesIcon(species) {
  const iconMap = {
    dog: 'mdi:dog',
    cat: 'mdi:cat',
    bird: 'mdi:bird',
    fish: 'mdi:fish',
    rabbit: 'mdi:rabbit',
    hamster: 'mdi:hamster',
    horse: 'mdi:horse',
    other: 'mdi:paw'
  }

  return iconMap[species] || 'mdi:paw'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 