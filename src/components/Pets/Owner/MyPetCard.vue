<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <!-- Pet Icon -->
    <div class="relative">
      <!-- Default Icon -->
      <div class="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div class="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
          <Icon :icon="getSpeciesIcon(pet.species)" class="w-12 h-12 text-blue-600" />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="absolute top-3 right-3 flex items-center gap-1">
        <!-- Publish/Unpublish Toggle -->
        <button
          @click="handleTogglePublish"
          :class="[
            'p-2 backdrop-blur-sm rounded-lg shadow-sm transition-colors',
            pet.published
              ? 'bg-white/90 text-green-600 hover:bg-red-50 hover:text-red-600'
              : 'bg-white/90 text-gray-600 hover:bg-green-50 hover:text-green-600'
          ]"
          :title="pet.published ? 'Скрыть от публики' : 'Опубликовать'"
        >
          <Icon :icon="pet.published ? 'mdi:eye-off' : 'mdi:eye'" class="w-4 h-4" />
        </button>

        <button
          @click="$emit('edit', pet)"
          class="p-2 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm transition-colors"
          title="Edit pet"
        >
          <Icon icon="mdi:pencil" class="w-4 h-4" />
        </button>
        <button
          @click="$emit('delete', pet)"
          class="p-2 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-colors"
          title="Delete pet"
        >
          <Icon icon="mdi:delete" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Pet Info -->
    <div class="p-4">
      <!-- Name and Species -->
      <div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          {{ pet.name || 'Unnamed Pet' }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ formatSpecies(pet.species) }} • {{ pet.breed || 'Unknown breed' }}
        </p>
      </div>

      <!-- Details -->
      <div class="space-y-2 mb-3">
        <div v-if="pet.gender" class="flex items-center gap-2 text-sm text-gray-600">
          <Icon :icon="pet.gender.toLowerCase() === 'boy' ? 'mdi:gender-male' : 'mdi:gender-female'" class="w-4 h-4" />
          <span>{{ pet.gender }}</span>
        </div>

        <div v-if="pet.color" class="flex items-center gap-2 text-sm text-gray-600">
          <Icon icon="mdi:palette" class="w-4 h-4" />
          <span>{{ pet.color }}</span>
        </div>

        <div v-if="pet.pet_size" class="flex items-center gap-2 text-sm text-gray-600">
          <Icon icon="mdi:ruler" class="w-4 h-4" />
          <span class="capitalize">{{ pet.pet_size }}</span>
        </div>

        <div v-if="pet.dob" class="flex items-center gap-2 text-sm text-gray-600">
          <Icon icon="mdi:cake-variant" class="w-4 h-4" />
          <span>{{ formatDate(pet.dob) }}</span>
        </div>
      </div>

      <!-- Description -->
      <div v-if="pet.description" class="mb-3">
        <p class="text-sm text-gray-600 line-clamp-2">{{ pet.description }}</p>
      </div>

      <!-- Status -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <Icon
            :icon="pet.published ? 'mdi:eye' : 'mdi:eye-off'"
            :class="pet.published ? 'text-green-500' : 'text-gray-400'"
            class="w-4 h-4"
          />
          <span class="text-xs" :class="pet.published ? 'text-green-600' : 'text-gray-500'">
            {{ pet.published ? 'Опубликован' : 'Черновик' }}
          </span>
        </div>

        <span class="text-xs text-gray-400">
          {{ formatDate(pet.created) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  pet: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete', 'togglePublish'])

// Добавляем функцию для обработки переключения публикации
function handleTogglePublish() {
  // Проверяем, что у питомца есть ID
  console.log('🔍 Pet object in handleTogglePublish:', props.pet)
  console.log('🔍 Pet ID:', props.pet.id)
  console.log('🔍 Pet keys:', Object.keys(props.pet))

  if (!props.pet.id) {
    console.error('❌ Pet ID is missing:', props.pet)
    return
  }

  console.log('🔄 Emitting togglePublish for pet:', props.pet.id, 'Current status:', props.pet.published)
  emit('togglePublish', props.pet)
}

function formatSpecies(species) {
  if (!species) return 'Unknown'
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase()
}

function getSpeciesIcon(species) {
  if (!species) return 'mdi:paw'

  const iconMap = {
    // Категории из базы данных
    dog: 'mdi:dog',
    cat: 'mdi:cat',
    rodents: 'mdi:hamster',
    rabbits: 'mdi:rabbit',
    mammals: 'mdi:deer',
    camels: 'mdi:camel',
    horse: 'mdi:horse',
    reptiles: 'mdi:snake',
    amphibians: 'mdi:frog',
    fowl: 'mdi:bird',
    anthropods: 'mdi:ant',
    crustaceans: 'mdi:crab',
    fish: 'mdi:fish',
    insects: 'mdi:bug',
    arachnids: 'mdi:spider',
    pigs: 'mdi:pig',
    birds_of_prey: 'mdi:eagle',

    // Альтернативные названия для совместимости
    'birds-of-prey': 'mdi:eagle',
    'mammals (land)': 'mdi:deer',
    'mammals_land': 'mdi:deer',
    'mammals-land': 'mdi:deer',
  }

  const speciesLower = species.toLowerCase()

  // Проверяем точное совпадение
  if (iconMap[speciesLower]) {
    return iconMap[speciesLower]
  }

  // Проверяем частичное совпадение для гибкости
  for (const [key, icon] of Object.entries(iconMap)) {
    if (speciesLower.includes(key) || key.includes(speciesLower)) {
      return icon
    }
  }

  // Fallback иконки по категориям
  if (speciesLower.includes('dog') || speciesLower.includes('canine')) {
    return 'mdi:dog'
  }
  if (speciesLower.includes('cat') || speciesLower.includes('feline')) {
    return 'mdi:cat'
  }
  if (speciesLower.includes('rodent') || speciesLower.includes('hamster') || speciesLower.includes('mouse') || speciesLower.includes('rat') || speciesLower.includes('guinea')) {
    return 'mdi:hamster'
  }
  if (speciesLower.includes('rabbit') || speciesLower.includes('bunny')) {
    return 'mdi:rabbit'
  }
  if (speciesLower.includes('mammal') || speciesLower.includes('deer') || speciesLower.includes('fox')) {
    return 'mdi:deer'
  }
  if (speciesLower.includes('camel') || speciesLower.includes('llama')) {
    return 'mdi:camel'
  }
  if (speciesLower.includes('horse') || speciesLower.includes('pony') || speciesLower.includes('donkey')) {
    return 'mdi:horse'
  }
  if (speciesLower.includes('reptile') || speciesLower.includes('snake') || speciesLower.includes('lizard') || speciesLower.includes('turtle')) {
    return 'mdi:snake'
  }
  if (speciesLower.includes('amphibian') || speciesLower.includes('frog') || speciesLower.includes('toad') || speciesLower.includes('salamander')) {
    return 'mdi:frog'
  }
  if (speciesLower.includes('fowl') || speciesLower.includes('bird') || speciesLower.includes('chicken') || speciesLower.includes('duck')) {
    return 'mdi:bird'
  }
  if (speciesLower.includes('anthropod') || speciesLower.includes('ant') || speciesLower.includes('beetle')) {
    return 'mdi:ant'
  }
  if (speciesLower.includes('crustacean') || speciesLower.includes('crab') || speciesLower.includes('lobster') || speciesLower.includes('shrimp')) {
    return 'mdi:crab'
  }
  if (speciesLower.includes('fish') || speciesLower.includes('aquarium')) {
    return 'mdi:fish'
  }
  if (speciesLower.includes('insect') || speciesLower.includes('bug') || speciesLower.includes('beetle') || speciesLower.includes('butterfly')) {
    return 'mdi:bug'
  }
  if (speciesLower.includes('arachnid') || speciesLower.includes('spider') || speciesLower.includes('scorpion') || speciesLower.includes('tarantula')) {
    return 'mdi:spider'
  }
  if (speciesLower.includes('pig') || speciesLower.includes('boar')) {
    return 'mdi:pig'
  }
  if (speciesLower.includes('bird-of-prey') || speciesLower.includes('eagle') || speciesLower.includes('hawk') || speciesLower.includes('falcon')) {
    return 'mdi:eagle'
  }

  // Общий fallback
  return 'mdi:paw'
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch (error) {
    return ''
  }
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
