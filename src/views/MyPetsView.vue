<template>
  <MainLayout>
    <template #left-sidebar> </template>

    <template #default>
      <!-- List View -->
      <div v-if="currentView === 'list'" class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ $t('UI.mypets.title') }}
          </h1>
          <button
            @click="showEditView()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Icon icon="mdi:plus" class="w-5 h-5" />
            {{ $t('UI.mypets.add_pet') }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="petsStore.loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="petsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800">
            <Icon icon="mdi:alert-circle" class="w-5 h-5" />
            <span>{{ petsStore.error }}</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!petsStore.pets.length" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <Icon icon="mdi:paw" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ $t('UI.mypets.empty_title') }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ $t('UI.mypets.empty_description') }}
            </p>
            <button
              @click="showEditView()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Icon icon="mdi:plus" class="w-5 h-5" />
              {{ $t('UI.mypets.add_first_pet') }}
            </button>
          </div>
        </div>

        <!-- Pets Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MyPetCard
            v-for="pet in petsStore.pets"
            :key="pet.id"
            :pet="pet"
            @edit="handleEditPet"
            @delete="handleDeletePet"
            @view="handleViewPet"
            @share="handleSharePet"
          />
        </div>
      </div>

      <!-- Edit View -->
      <div v-else-if="currentView === 'edit'" class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="showListView()"
              class="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon icon="mdi:arrow-left" class="w-6 h-6" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? $t('UI.pets.edit.title') : $t('UI.pets.add.title') }}
            </h1>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Basic Info Section -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ $t('UI.pets.edit.basic_info') }}
              </h3>

              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('UI.pets.fields.name') }} *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('UI.pets.placeholders.name')"
                />
              </div>

              <!-- Type and Breed -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ $t('UI.pets.fields.type') }} *
                  </label>
                  <select
                    v-model="form.type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{{ $t('UI.pets.placeholders.select_type') }}</option>
                    <option value="dog">{{ $t('UI.pets.types.dog') }}</option>
                    <option value="cat">{{ $t('UI.pets.types.cat') }}</option>
                    <option value="bird">{{ $t('UI.pets.types.bird') }}</option>
                    <option value="fish">{{ $t('UI.pets.types.fish') }}</option>
                    <option value="other">{{ $t('UI.pets.types.other') }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ $t('UI.pets.fields.breed') }}
                  </label>
                  <input
                    v-model="form.breed"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="$t('UI.pets.placeholders.breed')"
                  />
                </div>
              </div>

              <!-- Age and Weight -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ $t('UI.pets.fields.age') }}
                  </label>
                  <input
                    v-model.number="form.age"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="$t('UI.pets.placeholders.age')"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ $t('UI.pets.fields.weight') }}
                  </label>
                  <input
                    v-model.number="form.weight"
                    type="number"
                    step="0.1"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="$t('UI.pets.placeholders.weight')"
                  />
                </div>
              </div>

              <!-- Color -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('UI.pets.fields.color') }}
                </label>
                <input
                  v-model="form.color"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('UI.pets.placeholders.color')"
                />
              </div>

              <!-- Microchip -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('UI.pets.fields.microchip') }}
                </label>
                <input
                  v-model="form.microchip"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('UI.pets.placeholders.microchip')"
                />
              </div>
            </div>

            <!-- Photo Section -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ $t('UI.pets.edit.photo') }}
              </h3>

              <div class="flex items-center space-x-4">
                <div class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon v-if="!form.photo" icon="mdi:camera" class="w-8 h-8 text-gray-400" />
                  <img v-else :src="form.photo" class="w-full h-full object-cover rounded-lg" />
                </div>

                <div class="flex-1">
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    @change="handlePhotoChange"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="$refs.photoInput.click()"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {{ $t('UI.pets.actions.upload_photo') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Media Section -->
            <div class="space-y-4">
              <MediaSection
                :current-media="petMedia"
                @add-media="handleAddMedia"
                @remove-media="handleRemoveMedia"
              />
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="showListView()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {{ $t('UI.common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <span v-if="loading" class="flex items-center">
                  <Icon icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
                  {{ $t('UI.common.saving') }}
                </span>
                <span v-else>
                  {{ isEditMode ? $t('UI.common.save') : $t('UI.common.create') }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePetsStore } from '@/stores/PetsStore'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import MainLayout from '@/layouts/MainLayout.vue'
import MyPetCard from '@/components/Pets/Owner/MyPetCard.vue'
import MediaSection from '@/components/Pets/Owner/MediaSection.vue'

const petsStore = usePetsStore()
const router = useRouter()

// View state
const currentView = ref('list') // 'list' or 'edit'
const selectedPet = ref(null)
const loading = ref(false)

// Form data
const form = ref({
  name: '',
  type: '',
  breed: '',
  age: null,
  weight: null,
  color: '',
  microchip: '',
  photo: null,
})

// Computed
const isEditMode = computed(() => !!selectedPet.value)

onMounted(() => {
  petsStore.fetchMyPets()
})

// View switching
function showListView() {
  currentView.value = 'list'
  selectedPet.value = null
  resetForm()
}

function showEditView(pet = null) {
  currentView.value = 'edit'
  selectedPet.value = pet
  if (pet) {
    loadPetData(pet)
  } else {
    resetForm()
  }
}

// Form methods
function resetForm() {
  form.value = {
    name: '',
    type: '',
    breed: '',
    age: null,
    weight: null,
    color: '',
    microchip: '',
    photo: null,
  }
}

function loadPetData(pet) {
  form.value = {
    name: pet.name || '',
    type: pet.type || '',
    breed: pet.breed || '',
    age: pet.age || null,
    weight: pet.weight || null,
    color: pet.color || '',
    microchip: pet.microchip || '',
    photo: pet.photo || null,
  }
}

function handlePhotoChange(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.photo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function handleSubmit() {
  loading.value = true
  try {
    const petData = { ...form.value }

    if (selectedPet.value) {
      // Edit existing pet
      await petsStore.updatePet(selectedPet.value.id, petData)
    } else {
      // Create new pet
      await petsStore.addPet(petData)
    }

    showListView()
  } catch (error) {
    console.error('Error saving pet:', error)
  } finally {
    loading.value = false
  }
}

// Pet actions
function handleEditPet(pet) {
  showEditView(pet)
}

function handleDeletePet(pet) {
  // Здесь можно добавить подтверждение удаления
  petsStore.deletePet(pet.id)
}

function handleViewPet(pet) {
  router.push({ name: 'pet-details', params: { id: pet.id } })
}

function handleSharePet(pet) {
  // Здесь можно реализовать функционал шаринга
  console.log('Share pet:', pet)
}

// Media handling
const petMedia = ref([])

function handleAddMedia(newMedia) {
  petMedia.value = [...petMedia.value, ...newMedia]
}

function handleRemoveMedia(mediaId) {
  petMedia.value = petMedia.value.filter((media) => media.id !== mediaId)
}
</script>

<style scoped>
/* Component styles here */
</style>
