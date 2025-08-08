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

        <!-- Loading State - УБИРАЕМ ЭТОТ БЛОК -->
        <!-- <div v-if="petsStore.loading" class="flex justify-center py-8">
          <div class="flex items-center gap-2 text-gray-600">
            <Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
            {{ $t('UI.common.loading') }}
          </div>
        </div> -->

        <!-- Error State -->
        <div v-if="petsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800">
            <Icon icon="mdi:alert-circle" class="w-5 h-5" />
            <span>{{ petsStore.error }}</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="petsStore.pets.length === 0" class="text-center py-12">
          <Icon icon="mdi:paw" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ $t('UI.mypets.no_pets') }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ $t('UI.mypets.no_pets_description') }}
          </p>
          <button
            @click="showEditView()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Icon icon="mdi:plus" class="w-5 h-5" />
            {{ $t('UI.mypets.add_first_pet') }}
          </button>
        </div>

        <!-- Pets Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MyPetCard
            v-for="pet in petsStore.pets"
            :key="pet.id"
            :pet="pet"
            @edit="showEditView(pet)"
            @delete="handleDeletePet(pet)"
            @toggle-publish="handleTogglePublish(pet)"
          />
        </div>
      </div>

      <!-- Edit View -->
      <div v-else-if="currentView === 'edit'" class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode ? $t('UI.pets.edit_pet') : $t('UI.pets.add_pet') }}
          </h1>
          <button
            @click="handleCancel"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <form @submit.prevent="handleSave" class="space-y-6">
            <!-- Main Photos Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Фотографии питомца (до 4 фото)
              </label>

              <!-- Photos Grid -->
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <!-- Existing Photos -->
                <div
                  v-for="(photo, index) in form.main_photos"
                  :key="`photo-${index}`"
                  class="relative group aspect-square"
                >
                  <!-- Photo Preview -->
                  <img
                    :src="photo.url"
                    :alt="`${form.name || 'Pet'} photo ${index + 1}`"
                    class="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer"
                    :class="{ 'opacity-50': photo.uploading }"
                    @click="previewPhoto(photo.url)"
                  />

                  <!-- Upload Status Overlay -->
                  <div
                    v-if="photo.uploading"
                    class="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center"
                  >
                    <div class="bg-white rounded-lg p-2 flex items-center gap-2">
                      <Icon icon="mdi:loading" class="w-4 h-4 animate-spin text-blue-500" />
                      <span class="text-xs text-gray-600">Загрузка...</span>
                    </div>
                  </div>

                  <!-- Error Status -->
                  <div
                    v-if="photo.uploadError"
                    class="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center"
                  >
                    <div class="bg-white rounded-lg p-2 flex items-center gap-2">
                      <Icon icon="mdi:alert-circle" class="w-4 h-4 text-red-500" />
                      <span class="text-xs text-red-600">Ошибка</span>
                    </div>
                  </div>

                  <!-- Edit button (всегда видимая) -->
                  <button
                    @click.stop.prevent="editPhoto(photo)"
                    type="button"
                    class="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg z-10"
                    title="Редактировать фото"
                  >
                    <Icon icon="mdi:camera-plus" class="w-4 h-4" />
                  </button>

                  <!-- Delete button (всегда видимая) -->
                  <button
                    @click.stop.prevent="removePhoto(photo)"
                    type="button"
                    :disabled="photo.deleting"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="photo.deleting ? 'Удаление...' : 'Удалить'"
                  >
                    <Icon
                      v-if="!photo.deleting"
                      icon="mdi:close"
                      class="w-3 h-3"
                    />
                    <Icon
                      v-else
                      icon="mdi:loading"
                      class="w-3 h-3 animate-spin"
                    />
                  </button>

                  <!-- Photo number -->
                  <div class="absolute top-2 left-2 pointer-events-none">
                    <div class="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {{ index + 1 }}
                    </div>
                  </div>
                </div>

                <!-- Add Photo Placeholder (показывается если меньше 4 фото) -->
                <div
                  v-if="(!form.main_photos || form.main_photos.length < 4)"
                  class="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer group"
                  @click="showPhotoEditor"
                  @dragover.prevent
                  @drop.prevent="handlePhotoDrop"
                >
                  <div class="text-center">
                    <Icon
                      icon="mdi:camera-plus"
                      class="w-8 h-8 text-gray-400 group-hover:text-gray-500 mx-auto mb-2 transition-colors"
                    />
                    <p class="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                      Добавить фото
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ form.main_photos?.length || 0 }}/4
                    </p>
                  </div>
                </div>
              </div>

              <!-- Upload Progress -->
              <div v-if="photoUploading" class="mb-4">
                <div class="flex items-center gap-2 mb-2">
                  <Icon icon="mdi:loading" class="w-4 h-4 animate-spin text-blue-500" />
                  <span class="text-sm text-gray-600">
                    Обработка фотографии...
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Info -->
              <div class="text-sm text-gray-600">
                <p class="flex items-center gap-1">
                  <Icon icon="mdi:information" class="w-4 h-4" />
                  Все фотографии равнозначные
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Нажмите на фотографию для предпросмотра • Перетащите файлы для быстрого добавления
                </p>
              </div>
            </div>

            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('UI.pets.fields.name') }}
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  @blur="validateField('name', form.name)"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    hasError('name') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  :placeholder="$t('UI.pets.placeholders.name')"
                />
                <div v-if="hasError('name')" class="mt-1 text-sm text-red-600">
                  {{ errors.name }}
                </div>
              </div>

              <!-- Species and Breed in one row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Species -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('UI.pets.fields.species') }} *
                  </label>
                  <select
                    v-model="form.species"
                    @blur="validateField('species', form.species)"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                      hasError('species') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    ]"
                  >
                    <option value="">{{ $t('UI.pets.placeholders.select_species') }}</option>
                    <option
                      v-for="species in petSpeciesOptions"
                      :key="species.value"
                      :value="species.value"
                      :disabled="species.disabled"
                    >
                      {{ species.label }}
                    </option>
                  </select>
                  <div v-if="hasError('species')" class="mt-1 text-sm text-red-600">
                    {{ errors.species }}
                  </div>
                </div>

                <!-- Breed -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('UI.pets.fields.breed') }} *
                  </label>
                  <input
                    v-model="form.breed"
                    type="text"
                    @blur="validateField('breed', form.breed)"
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                      hasError('breed') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    ]"
                    :placeholder="$t('UI.pets.placeholders.breed')"
                  />
                  <div v-if="hasError('breed')" class="mt-1 text-sm text-red-600">
                    {{ errors.breed }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Gender, Date of Birth, Color, Pet Size in two rows for mobile -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- First row on mobile (Gender, DOB) -->
              <!-- Gender -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('UI.pets.fields.gender') }}
                </label>
                <select
                  v-model="form.gender"
                  @blur="validateField('gender', form.gender)"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    hasError('gender') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  ]"
                >
                  <option value="">{{ $t('UI.pets.placeholders.select_gender') }}</option>
                  <option value="Boy">{{ $t('UI.pets.placeholders.select_boy') }}</option>
                  <option value="Girl">{{ $t('UI.pets.placeholders.select_girl') }}</option>
                </select>
                <div v-if="hasError('gender')" class="mt-1 text-sm text-red-600">
                  {{ errors.gender }}
                </div>
              </div>

              <!-- Date of Birth (Year and Month only) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('UI.pets.fields.dob') }}
                </label>
                <input
                  v-model="form.dob"
                  type="month"
                  @blur="validateField('dob', form.dob)"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    hasError('dob') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  :max="getCurrentMonth()"
                  placeholder="YYYY-MM"
                />
                <div v-if="hasError('dob')" class="mt-1 text-sm text-red-600">
                  {{ errors.dob }}
                </div>
              </div>

              <!-- Second row on mobile (Color, Size) -->
              <!-- Color -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('UI.pets.fields.color') }}
                </label>
                <input
                  v-model="form.color"
                  type="text"
                  @blur="validateField('color', form.color)"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    hasError('color') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  :placeholder="$t('UI.pets.placeholders.color')"
                />
                <div v-if="hasError('color')" class="mt-1 text-sm text-red-600">
                  {{ errors.color }}
                </div>
              </div>

              <!-- Pet Size -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('UI.pets.fields.pet_size') }}
                </label>
                <select
                  v-model="form.pet_size"
                  @blur="validateField('pet_size', form.pet_size)"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    hasError('pet_size') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  ]"
                >
                  <option value="">{{ $t('UI.pets.placeholders.select_size') }}</option>
                  <option value="small">{{ $t('UI.pets.placeholders.select_small') }}</option>
                  <option value="medium">{{ $t('UI.pets.placeholders.select_medium') }}</option>
                  <option value="large">{{ $t('UI.pets.placeholders.select_large') }}</option>
                </select>
                <div v-if="hasError('pet_size')" class="mt-1 text-sm text-red-600">
                  {{ errors.pet_size }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('UI.pets.fields.description') }}
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                @blur="validateField('description', form.description)"
                :class="[
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                  hasError('description') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                ]"
                :placeholder="$t('UI.pets.placeholders.description')"
              ></textarea>
              <div v-if="hasError('description')" class="mt-1 text-sm text-red-600">
                {{ errors.description }}
              </div>
            </div>

            <!-- Published Status -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    v-model="form.published"
                    type="checkbox"
                    :true-value="1"
                    :false-value="0"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div class="ml-3">
                    <label class="text-sm font-medium text-gray-900">
                      {{ $t('UI.pets.fields.published') }}
                    </label>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ form.published ? 'Питомец виден всем пользователям' : 'Питомец виден только вам' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center">
                  <Icon
                    :icon="form.published ? 'mdi:eye' : 'mdi:eye-off'"
                    :class="form.published ? 'text-green-500' : 'text-gray-400'"
                    class="w-5 h-5"
                  />
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="handleCancel"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {{ $t('UI.common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <span v-if="loading">
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

  <!-- Confirm Dialogs -->
  <ConfirmDialog
    :is-open="showCancelDialog"
    title="Discard Changes"
    message="You have unsaved changes. Are you sure you want to discard them?"
    icon="mdi:alert-circle"
    icon-class="text-yellow-500"
    confirm-text="Discard"
    cancel-text="Keep Editing"
    type="warning"
    @confirm="confirmCancel"
    @cancel="showCancelDialog = false"
  />

  <ConfirmDialog
    :is-open="showDeleteDialog"
    title="Delete Pet"
    :message="`Are you sure you want to delete ${petToDelete?.name}? This action cannot be undone.`"
    icon="mdi:delete"
    icon-class="text-red-500"
    confirm-text="Delete"
    cancel-text="Cancel"
    type="danger"
    @confirm="confirmDelete"
    @cancel="showDeleteDialog = false"
  />

  <!-- Photo Preview Dialog -->
  <Dialog
    :model-value="showPhotoPreview"
    @close="closePhotoPreview"
    title="Предпросмотр фотографии"
    size="xl"
  >
    <div class="flex items-center justify-center">
      <img
        :src="previewPhotoUrl"
        alt="Photo preview"
        class="max-w-full max-h-96 object-contain rounded-lg"
      />
    </div>
  </Dialog>

  <!-- Photo Editor Dialog -->
  <Dialog
    :model-value="showPhotoEditorDialog"
    @close="closePhotoEditor"
    title="Редактирование фото питомца"
    size="lg"
  >
    <div v-if="showPhotoEditorDialog">
      <p class="text-sm text-gray-500 mb-2">Debug: Dialog is open, editing index: {{ editingPhotoIndex }}</p>
      <PetPhotoEditor
        @save="handlePhotoSave"
        @cancel="closePhotoEditor"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { usePetsStore } from '@/stores/PetsStore'
import { useUserStore } from '@/stores/UserStore'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { toast } from 'vue3-toastify'
import MainLayout from '@/layouts/MainLayout.vue'
import MyPetCard from '@/components/Pets/Owner/MyPetCard.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PetPhotoEditor from '@/components/Pets/PetPhotoEditor.vue'
import Dialog from '@/components/ui/Dialog.vue'
import { getFullImageUrl } from '@/utils/imageUtils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // для работы с UTC
import timezone from 'dayjs/plugin/timezone' // для работы с временными зонами
import { PET_SPECIES } from '@/constants/petSpecies.js'

// Инициализируем плагины
dayjs.extend(utc)
dayjs.extend(timezone)

const petsStore = usePetsStore()
const userStore = useUserStore() // Добавляем userStore
const router = useRouter()

// View state
const currentView = ref('list')
const selectedPet = ref(null)
const loading = ref(false)
const hasUnsavedChanges = ref(false)

// Dialog state
const showCancelDialog = ref(false)
const showDeleteDialog = ref(false)
const petToDelete = ref(null)

// Photo editor state
const showPhotoEditorDialog = ref(false)
const editingPhoto = ref(null) // Сохраняем объект фото, не индекс
const photoUploading = ref(false)
const uploadProgress = ref(0)
const showPhotoPreview = ref(false)
const previewPhotoUrl = ref('')

// Form data
const form = ref({
  id: null, // Добавляем ID питомца
  name: '',
  species: '',
  breed: '',
  gender: '',
  dob: '',
  color: '',
  description: '',
  pet_size: '',
  published: 1,
  main_photos: [], // Массив фотографий вместо одной
  main_photo_files: [] // Массив файлов для загрузки
})

// Validation errors
const errors = reactive({
  name: '',
  species: '',
  breed: '',
  gender: '',
  dob: '',
  color: '',
  description: '',
  pet_size: ''
})

// Computed
const isEditMode = computed(() => !!selectedPet.value)
const petSpeciesOptions = computed(() => PET_SPECIES.getWithPopularFirst())

// Validation functions
function validateField(fieldName, value) {
  errors[fieldName] = ''

  switch (fieldName) {
    case 'name':
      // Имя необязательное, но если указано, должно быть валидным
      if (value && value.trim() !== '') {
        if (value.length < 2) {
          errors.name = 'Name must be at least 2 characters'
        } else if (value.length > 100) {
          errors.name = 'Name cannot exceed 100 characters'
        }
      }
      break

    case 'species':
      // Вид животного - обязательное поле
      if (!value || value.trim() === '') {
        errors.species = 'Species is required'
      } else if (value.length > 100) {
        errors.species = 'Species cannot exceed 100 characters'
      }
      break

    case 'breed':
      // Порода - обязательное поле
      if (!value || value.trim() === '') {
        errors.breed = 'Breed is required'
      } else if (value.length > 100) {
        errors.breed = 'Breed cannot exceed 100 characters'
      }
      break

    case 'gender':
      if (value && value.length > 10) {
        errors.gender = 'Gender cannot exceed 10 characters'
      }
      break

    case 'dob':
      if (value && value.trim() !== '') {
        // Проверяем формат YYYY-MM
        const dateRegex = /^\d{4}-\d{2}$/
        if (!dateRegex.test(value)) {
          errors.dob = 'Please enter a valid date in YYYY-MM format'
        } else {
          const [year, month] = value.split('-')
          const yearNum = parseInt(year)
          const monthNum = parseInt(month)

          // Проверяем диапазон года (не раньше 1990 и не позже текущего года)
          const currentYear = new Date().getFullYear()
          if (yearNum < 1990 || yearNum > currentYear) {
            errors.dob = `Year must be between 1990 and ${currentYear}`
          }

          // Проверяем диапазон месяца
          if (monthNum < 1 || monthNum > 12) {
            errors.dob = 'Month must be between 01 and 12'
          }

          // Проверяем, что дата не в будущем
          const selectedDate = new Date(yearNum, monthNum - 1)
          const currentDate = new Date()
          if (selectedDate > currentDate) {
            errors.dob = 'Date of birth cannot be in the future'
          }
        }
      }
      break

    case 'color':
      if (value && value.length > 50) {
        errors.color = 'Color cannot exceed 50 characters'
      }
      break

    case 'description':
      if (value && value.length > 1000) {
        errors.description = 'Description cannot exceed 1000 characters'
      }
      break

    case 'pet_size':
      if (value && value.length > 45) {
        errors.pet_size = 'Size cannot exceed 45 characters'
      }
      break
  }
}

// Validate all fields
function validateForm() {
  // Принудительно валидируем все поля
  validateField('name', form.value.name)
  validateField('species', form.value.species)
  validateField('breed', form.value.breed)
  validateField('gender', form.value.gender)
  validateField('dob', form.value.dob)
  validateField('color', form.value.color)
  validateField('description', form.value.description)
  validateField('pet_size', form.value.pet_size)

  const hasErrors = Object.values(errors).some(error => error !== '')
  return !hasErrors
}

// Check if field has error
function hasError(fieldName) {
  return errors[fieldName] !== ''
}

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
  console.log('🔍 showEditView called with pet:', pet)
  console.log('🔍 selectedPet.value before:', selectedPet.value)

  currentView.value = 'edit'
  selectedPet.value = pet
  hasUnsavedChanges.value = false

  console.log('🔍 selectedPet.value after:', selectedPet.value)

  if (pet) {
    console.log('🔍 Loading pet data for:', pet)
    loadPetData(pet)
  } else {
    console.log('🔍 Resetting form (no pet provided)')
    resetForm()
  }
}

// Form methods
function resetForm() {
  form.value = {
    id: null,
    name: '',
    species: '',
    breed: '',
    gender: '',
    dob: '',
    color: '',
    description: '',
    pet_size: '',
    published: 1,
    main_photos: [],
    main_photo_files: []
  }
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  hasUnsavedChanges.value = false
}

function loadPetData(pet) {
  console.log('🔍 Loading pet data:', pet)
  console.log('🔍 Pet main_photos:', pet.main_photos)

  // Обрабатываем фотографии из нового формата
  let mainPhotos = []
  if (pet.main_photos && Array.isArray(pet.main_photos)) {
    mainPhotos = pet.main_photos.map((photo, index) => {
      console.log(`📸 Photo ${index}:`, photo)

      const fullUrl = getFullImageUrl(photo.url)
      console.log(`🔗 Full URL for photo ${index}:`, fullUrl)

      // Убеждаемся, что filename сохраняется правильно
      const filename = photo.filename || getFilenameFromPath(photo.url)
      console.log(`🔗 Filename for photo ${index}:`, filename)

      return {
        id: photo.id, // Добавляем ID если есть
        filename: filename,
        url: fullUrl,
        uploaded: true,
        serverUrl: fullUrl
      }
    })
  }

  console.log('📋 Processed mainPhotos:', mainPhotos)

  // В loadPetData при загрузке данных:
  let formattedDob = ''
  if (pet.dob) {
    try {
      formattedDob = dayjs(pet.dob).format('YYYY-MM')
      console.log('📅 Date conversion:', {
        original: pet.dob,
        formatted: formattedDob
      })
    } catch (error) {
      console.warn('⚠️ Error formatting date:', pet.dob, error)
    }
  }

  form.value = {
    ...form.value,
    id: pet.id,
    name: pet.name || '',
    species: pet.species || '',
    breed: pet.breed || '',
    gender: pet.gender || '',
    dob: formattedDob, // Используем отформатированную дату
    color: pet.color || '',
    description: pet.description || '',
    pet_size: pet.pet_size || '',
    published: pet.published !== undefined ? pet.published : 1,
    main_photos: mainPhotos
  }

  console.log('📝 Form loaded with data:', form.value)
}

// Watch for form changes
watch(form, () => {
  hasUnsavedChanges.value = true
}, { deep: true })

// Save method with validation
async function handleSave() {
  console.log('=== SAVE METHOD START ===')
  console.log('Form data:', form.value)
  console.log('Is edit mode:', isEditMode.value)
  console.log('Selected pet ID:', selectedPet.value?.id)
  console.log('Form pet ID:', form.value.id)

  const isValid = validateForm()
  console.log('Is form valid:', isValid)

  if (!isValid) {
    console.log('Form is invalid, showing error toast')
    console.log('Validation errors:', errors)
    toast.error('Please fix the validation errors')
    return
  }

  console.log('Form is valid, proceeding with save')
  loading.value = true

  try {
    if (isEditMode.value) {
      // ИСПРАВЛЯЕМ: Используем ID из формы
      const petId = form.value.id
      console.log('🔄 Updating pet:', petId)

      if (!petId) {
        throw new Error('Pet ID is required for update')
      }

      // Подготавливаем данные для отправки
      const dataToSend = {
        name: form.value.name,
        species: form.value.species,
        breed: form.value.breed,
        gender: form.value.gender,
        // Исправляем преобразование даты при отправке
        dob: form.value.dob ? dayjs(form.value.dob + '-01').utc().format() : null,
        color: form.value.color,
        description: form.value.description,
        pet_size: form.value.pet_size,
        published: form.value.published
      }

      console.log('📤 Data to send:', {
        ...dataToSend,
        originalDob: form.value.dob,
        convertedDob: dataToSend.dob
      })

      const response = await petsStore.updatePet(petId, dataToSend)
      console.log('✅ Update response:', response)

      // ИСПРАВЛЯЕМ: Обновляем selectedPet.value с новыми данными
      if (response?.pet) {
        console.log('🔄 Before updating selectedPet:', selectedPet.value)
        console.log('🔄 Response pet data:', response.pet)
        selectedPet.value = response.pet
        console.log('🔄 After updating selectedPet:', selectedPet.value)

        // Также обновляем form.value с новыми данными
        form.value = {
          ...form.value,
          ...response.pet,
          main_photos: response.pet.main_photos || form.value.main_photos
        }
        console.log('✅ Updated form.value:', form.value)

        // Обновляем данные в store
        await petsStore.fetchMyPets()
        console.log(' Reloaded pets from store')
      } else {
        console.warn('⚠️ No pet data in response:', response)
      }

      // Upload photos if selected
      if (form.value.main_photo_files && form.value.main_photo_files.length > 0 && petId) {
        console.log('📸 Uploading photos for existing pet')
        try {
          for (let i = 0; i < form.value.main_photo_files.length; i++) {
            console.log(` Uploading photo ${i + 1}/${form.value.main_photo_files.length}`)
            await petsStore.uploadPetPhoto(petId, form.value.main_photo_files[i], i)
          }
          toast.success('Питомец обновлен и фото загружены!')
        } catch (photoError) {
          console.error('Photo upload error:', photoError)
          toast.warning('Питомец обновлен, но загрузка фото не удалась')
        }
      } else {
        toast.success('Питомец обновлен успешно!')
      }
    } else {
      console.log('➕ Creating new pet')

      // Подготавливаем данные для отправки
      const dataToSend = {
        name: form.value.name,
        species: form.value.species,
        breed: form.value.breed,
        gender: form.value.gender,
        dob: form.value.dob ? dayjs(form.value.dob + '-01').utc().format() : null, // Добавляем день месяца и конвертируем в ISO формат
        color: form.value.color,
        description: form.value.description,
        pet_size: form.value.pet_size,
        published: form.value.published
      }

      console.log('📤 Data to send:', dataToSend)

      const newPet = await petsStore.addPet(dataToSend)
      console.log('✅ Create response:', newPet)

      // ИСПРАВЛЯЕМ: Обновляем selectedPet.value с новыми данными
      if (newPet) {
        console.log('🔄 Before updating selectedPet:', selectedPet.value)
        selectedPet.value = newPet
        console.log('🔄 After updating selectedPet:', selectedPet.value)

        // Также обновляем form.value с новыми данными
        form.value = {
          ...form.value,
          ...newPet,
          main_photos: newPet.main_photos || form.value.main_photos
        }
        console.log('✅ Updated form.value:', form.value)
      } else {
        console.warn('⚠️ No pet data in create response:', newPet)
      }

      // Upload photos for new pet if selected
      if (form.value.main_photo_files && form.value.main_photo_files.length > 0 && newPet?.id) {
        console.log('📸 Uploading photos for new pet')
        try {
          for (let i = 0; i < form.value.main_photo_files.length; i++) {
            console.log(` Uploading photo ${i + 1}/${form.value.main_photo_files.length}`)
            await petsStore.uploadPetPhoto(newPet.id, form.value.main_photo_files[i], i)
          }
          toast.success('Питомец создан и фото загружены!')
        } catch (photoError) {
          console.error('Photo upload error for new pet:', photoError)
          toast.warning('Питомец создан, но загрузка фото не удалась')
        }
      } else {
        toast.success('Питомец создан успешно!')
      }
    }

    showListView()
  } catch (error) {
    console.error('❌ Save error:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    toast.error(error.message || 'Failed to save pet')
  } finally {
    loading.value = false
  }
}

// Cancel with confirmation
function handleCancel() {
  if (hasUnsavedChanges.value) {
    showCancelDialog.value = true
  } else {
    showListView()
  }
}

function confirmCancel() {
  showCancelDialog.value = false
  showListView()
}

// Delete methods
function handleDeletePet(pet) {
  petToDelete.value = pet
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!petToDelete.value) return

  try {
    await petsStore.deletePet(petToDelete.value.id)
    toast.success('Pet deleted successfully!')
  } catch (error) {
    toast.error(error.message || 'Failed to delete pet')
  } finally {
    showDeleteDialog.value = false
    petToDelete.value = null
  }
}

// Photo management methods
function previewPhoto(url) {
  console.log('👁️ previewPhoto called with url:', url)
  previewPhotoUrl.value = url
  showPhotoPreview.value = true
}

function closePhotoPreview() {
  showPhotoPreview.value = false
  previewPhotoUrl.value = ''
}

// Enhanced drag & drop
function handlePhotoDrop(event) {
  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    toast.error('Пожалуйста, перетащите изображения')
    return
  }

  const currentCount = form.value.main_photos?.length || 0
  const remainingSlots = 4 - currentCount

  if (imageFiles.length > remainingSlots) {
    toast.warning(`Можно добавить только ${remainingSlots} фото (${currentCount}/4)`)
    imageFiles.splice(remainingSlots)
  }

  if (imageFiles.length === 0) {
    return
  }

  // Process multiple files
  processMultipleFiles(imageFiles)
}

async function processMultipleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    uploadProgress.value = 0
    photoUploading.value = true

    try {
      await processFile(files[i])
      uploadProgress.value = 100

      // Small delay between files
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error(`Ошибка обработки файла ${files[i].name}`)
    }
  }

  photoUploading.value = false
  uploadProgress.value = 0
}

async function processFile(file) {
  return new Promise((resolve) => {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Файл ${file.name} слишком большой (максимум 5MB)`)
      resolve()
      return
    }

    // Simulate processing progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 20
      uploadProgress.value = progress
      if (progress >= 80) {
        clearInterval(progressInterval)
      }
    }, 100)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)

    // Initialize arrays if needed
    if (!form.value.main_photos) {
      form.value.main_photos = []
      form.value.main_photo_files = []
    }

    // Add to photos array
    form.value.main_photos.push({
      url: previewUrl,
      file: file,
      name: file.name
    })
    form.value.main_photo_files.push(file)

    setTimeout(() => {
      clearInterval(progressInterval)
      uploadProgress.value = 100
      resolve()
    }, 500)
  })
}

// Photo editor methods
function showPhotoEditor() {
  console.log('📷 showPhotoEditor called')
  editingPhoto.value = null // Новая фотография
  showPhotoEditorDialog.value = true
}

function editPhoto(photo) {
  console.log('✏️ editPhoto called with photo:', photo)
  console.log('📋 Photo has filename:', photo?.filename)
  console.log('📋 Photo has url:', photo?.url)
  console.log('📋 Photo has serverUrl:', photo?.serverUrl)
  console.log('📋 Photo object keys:', Object.keys(photo || {}))

  editingPhoto.value = photo
  showPhotoEditorDialog.value = true
}

function closePhotoEditor() {
  console.log('❌ closePhotoEditor called')
  showPhotoEditorDialog.value = false
  editingPhoto.value = null
}

async function removePhoto(photo) {
  console.log('🗑️ removePhoto called with photo:', photo)
  console.log('📋 Photo object details:', {
    id: photo.id,
    filename: photo.filename,
    url: photo.url,
    serverUrl: photo.serverUrl,
    uploaded: photo.uploaded,
    keys: Object.keys(photo)
  })

  try {
    // Если это режим редактирования и у нас есть ID питомца
    if (isEditMode.value && selectedPet.value?.id && photo.filename) {
      console.log('🗑️ Deleting photo from server:', photo.filename)

      // ИСПРАВЛЯЕМ: Ищем фотографию по URL, так как это самый надежный способ
      const photoIndex = form.value.main_photos.findIndex(p => {
        // Сравниваем по URL (самый надежный способ)
        if (p.url === photo.url) return true
        // Также проверяем по filename если есть
        if (p.filename && photo.filename && p.filename === photo.filename) return true
        // И по ID если есть
        if (p.id && photo.id && p.id === photo.id) return true
        return false
      })

      console.log('📋 Found photo index:', photoIndex)
      console.log('📋 All photos in form:', form.value.main_photos.map((p, idx) => ({
        index: idx,
        id: p.id,
        filename: p.filename,
        url: p.url
      })))

      if (photoIndex !== -1) {
        form.value.main_photos[photoIndex].deleting = true
      } else {
        console.error('❌ Photo not found in form array!')
        toast.error('Фотография не найдена в форме')
        return
      }

      // Получаем ID пользователя
      const userId = userStore.userData?.id

      // Удаляем с сервера
      const response = await petsStore.deletePetPhoto(selectedPet.value.id, photo.filename, userId)

      console.log('✅ Delete response:', response)

      // Удаляем из локального состояния
      if (photoIndex !== -1) {
        form.value.main_photos.splice(photoIndex, 1)
        form.value.main_photo_files.splice(photoIndex, 1)
      }

      // Показываем сообщение с информацией об оставшихся фото
      const remainingPhotos = response?.data?.remaining_photos || 0
      if (remainingPhotos === 0) {
        toast.success('Фото удалено! У питомца больше нет фотографий.')
      } else {
        toast.success(`Фото удалено! Осталось фотографий: ${remainingPhotos}`)
      }
    } else {
      console.log('⚠️ Not deleting from server - conditions not met:', {
        isEditMode: isEditMode.value,
        hasPetId: !!selectedPet.value?.id,
        hasFilename: !!photo.filename
      })

      // Если это новый питомец или нет filename, просто удаляем из локального состояния
      const index = form.value.main_photos.findIndex(p => {
        // Сравниваем по URL (самый надежный способ)
        if (p.url === photo.url) return true
        // Также проверяем по filename если есть
        if (p.filename && photo.filename && p.filename === photo.filename) return true
        // И по ID если есть
        if (p.id && photo.id && p.id === photo.id) return true
        return false
      })

      if (index !== -1) {
        form.value.main_photos.splice(index, 1)
        form.value.main_photo_files.splice(index, 1)
        toast.success('Фото удалено из формы!')
      } else {
        console.error('❌ Photo not found in form array!')
        toast.error('Фотография не найдена в форме')
      }
    }
  } catch (error) {
    console.error('❌ Error removing photo:', error)

    // Показываем конкретное сообщение об ошибке
    let errorMessage = 'Ошибка при удалении фото'

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    toast.error(errorMessage)

    // Убираем индикатор загрузки при ошибке
    const photoIndex = form.value.main_photos.findIndex(p => {
      // Сравниваем по URL (самый надежный способ)
      if (p.url === photo.url) return true
      // Также проверяем по filename если есть
      if (p.filename && photo.filename && p.filename === photo.filename) return true
      // И по ID если есть
      if (p.id && photo.id && p.id === photo.id) return true
      return false
    })
    if (photoIndex !== -1) {
      form.value.main_photos[photoIndex].deleting = false
    }
  }
}

async function handlePhotoSave(file) {
  photoUploading.value = true

  try {
    const previewUrl = URL.createObjectURL(file)
    let replacedIndex = -1
    let isNewPhoto = false
    let originalFilename = null

    if (editingPhoto.value !== null) {
      // СОХРАНЯЕМ filename ДО всех операций
      originalFilename = editingPhoto.value?.filename
      console.log('💾 Saved original filename:', originalFilename)
      console.log('💾 Original editing photo keys:', Object.keys(editingPhoto.value || {}))
      console.log('💾 Original editing photo:', editingPhoto.value)

      // Находим фотографию для замены
      replacedIndex = form.value.main_photos.findIndex(p => {
        if (p.url === editingPhoto.value.url) return true
        if (p.filename && editingPhoto.value.filename && p.filename === editingPhoto.value.filename) return true
        if (p.id && editingPhoto.value.id && p.id === editingPhoto.value.id) return true
        return false
      })

      console.log('🎯 Found target index:', replacedIndex)

      if (replacedIndex !== -1) {
        // Заменяем фотографию, СОХРАНЯЯ оригинальный filename
        const originalPhoto = form.value.main_photos[replacedIndex]
        form.value.main_photos[replacedIndex] = {
          ...originalPhoto,                       // Сохраняем ВСЕ старые данные
          url: previewUrl,                        // Новое превью
          file: file,                            // Новый файл
          uploading: true,
          uploaded: false
        }
        form.value.main_photo_files[replacedIndex] = file

        // Если у оригинальной фотографии не было filename, берем из editingPhoto
        if (!originalFilename && originalPhoto?.filename) {
          originalFilename = originalPhoto.filename
        }

        console.log('✅ Photo replaced at index:', replacedIndex)
        console.log('📋 Final filename to send:', originalFilename)
      } else {
        console.error('❌ Target photo not found!')
        toast.error('Не удалось найти фотографию для замены')
        return
      }
    } else {
      // ДОБАВЛЕНИЕ нового фото
      console.log('➕ Adding new photo')
      isNewPhoto = true

      if (!form.value.main_photos) {
        form.value.main_photos = []
        form.value.main_photo_files = []
      }

      form.value.main_photos.push({
        url: previewUrl,
        file: file,
        uploading: true,
        uploaded: false
      })
      form.value.main_photo_files.push(file)
      replacedIndex = form.value.main_photos.length - 1

      console.log('✅ New photo added at index:', replacedIndex)
    }

    closePhotoEditor() // Закрываем ПОСЛЕ сохранения filename

    // ИСПРАВЛЯЕМ: При редактировании используем form.value.id, при создании - 0
    const petId = isEditMode.value ? form.value.id : 0
    console.log('🆔 Pet ID for photo upload:', petId, 'isEditMode:', isEditMode.value)

    // ОТПРАВКА НА СЕРВЕР с правильным filename
    if (isEditMode.value && petId) {
      const filename = isNewPhoto ? null : originalFilename
      console.log('🚀 Sending to server with filename:', filename)
      await uploadPhotoToServer(file, filename, replacedIndex)
    } else {
      form.value.main_photos[replacedIndex].uploading = false
      toast.success('Фото готово к сохранению!')
    }

  } catch (error) {
    console.error('Photo processing error:', error)
    toast.error('Ошибка при обработке фото')
  } finally {
    photoUploading.value = false
  }
}

// Функция загрузки на сервер
async function uploadPhotoToServer(file, filename = null, photoIndex) {
  try {
    console.log('🔥 uploadPhotoToServer called with:', {
      file: file ? `File(${file.name}, ${file.size} bytes)` : 'NULL',
      filename,
      photoIndex,
      fileType: typeof file,
      fileConstructor: file?.constructor?.name,
      isFile: file instanceof File,
      isBlob: file instanceof Blob
    })

    // КРИТИЧЕСКАЯ ПРОВЕРКА
    if (!file) {
      console.error('❌ No file provided to uploadPhotoToServer!')
      toast.error('Файл не найден для загрузки')
      return
    }

    // Проверяем, что это действительно File объект
    if (!(file instanceof File)) {
      console.error('❌ File is not a File object:', file)
      toast.error('Неправильный тип файла')
      return
    }

    // ИСПРАВЛЯЕМ: Используем правильный ID питомца
    let petId = form.value.id || selectedPet.value?.id

    if (!petId) {
      petId = 0
    }

    console.log('🆔 Using pet ID for upload:', petId)
    console.log('🆔 Form ID before upload:', form.value.id)
    console.log('🆔 SelectedPet ID before upload:', selectedPet.value?.id)

    const formData = new FormData()
    formData.append('photo', file)
    formData.append('pet_id', petId)

    if (filename) {
      formData.append('filename', filename)
      console.log('🔄 REPLACING existing file:', filename)
    } else {
      console.log('➕ ADDING new file')
    }

    // Дополнительная отладка
    console.log('📊 Request details:', {
      petId: petId,
      filename: filename || 'null',
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
      operation: filename ? 'REPLACE' : 'ADD'
    })

    // Отладка FormData
    console.log('📊 FormData contents:')
    for (let [key, value] of formData.entries()) {
      console.log(
        `  ${key}:`,
        typeof value === 'object'
          ? `File(${value.name}, ${value.size} bytes, ${value.type})`
          : value,
      )
    }

    const response = await petsStore.uploadPetPhoto(petId, file, filename)

    console.log('✅ Upload response:', response)
    console.log('✅ Full response structure:', JSON.stringify(response, null, 2))

    // В uploadPhotoToServer добавляем проверку успешной операции
    if (response?.data?.operation_skipped) {
      console.warn('⚠️ Upload skipped:', response.data.message)
      toast.warning(response.data.message || 'Операция пропущена')

      if (photoIndex >= 0 && form.value.main_photos[photoIndex]) {
        const photo = form.value.main_photos[photoIndex]
        photo.uploading = false
        photo.uploadError = true
      }
      return
    }

    // УСПЕШНАЯ ЗАГРУЗКА
    console.log('🎉 Successful upload:', response.data)

    if (photoIndex >= 0 && form.value.main_photos[photoIndex]) {
      const photo = form.value.main_photos[photoIndex]
      photo.uploading = false
      photo.uploaded = true
      photo.serverUrl = getFullImageUrl(response.data.photo_path)

      // Извлекаем только имя файла из полного пути
      photo.filename = getFilenameFromPath(response.data.photo_path) || response.data.filename

      // Обновляем URL для отображения
      photo.url = getFullImageUrl(response.data.photo_path)

      console.log('📸 Photo updated - filename:', photo.filename)
      console.log('📸 Photo updated - url:', photo.url)
    }

    toast.success('Фото загружено!')

    // 🔥 ВАЖНО: Обновляем данные питомца в store
    if (petId && petId !== 0) {
      console.log('🔄 Updating pet data in store...')

      const petInStore = petsStore.getPetById(petId)
      if (petInStore && petInStore.main_photos) {
        // Обновляем список фото в store
        petInStore.main_photos = form.value.main_photos.filter(p => p.uploaded || p.serverUrl)
        console.log('✅ Updated pet photos in store')
      }
    }

  } catch (error) {
    console.error('❌ Upload error:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })

    if (photoIndex >= 0 && form.value.main_photos[photoIndex]) {
      const photo = form.value.main_photos[photoIndex]
      photo.uploading = false
      photo.uploadError = true
    }

    toast.error(error.message || 'Failed to upload photo')
  }
}

// Функция для извлечения имени файла из пути
function getFilenameFromPath(path) {
  if (!path) return null

  // Извлекаем имя файла из пути (последняя часть после /)
  let filename = path.split('/').pop()

  // Удаляем параметры запроса (все что после ?)
  if (filename.includes('?')) {
    filename = filename.split('?')[0]
  }

  console.log('🔗 Extracted filename from path:', path, '→', filename)

  return filename
}

// Добавляем функцию для быстрого переключения публикации
async function handleTogglePublish(pet) {
  try {
    console.log('🔄 Toggling publish status for pet:', pet.id, 'Current status:', pet.published)

    const newStatus = pet.published ? 0 : 1

    await petsStore.updatePetStatus(pet.id, newStatus)
    console.log('✅ Pet status updated in store')

    // НЕ ОБНОВЛЯЕМ объект pet - store уже обновил данные реактивно
    // Компонент автоматически обновится через реактивность

    toast.success(newStatus ? 'Питомец опубликован!' : 'Питомец скрыт от публики!')
  } catch (error) {
    console.error('❌ Error toggling publish status:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    toast.error('Ошибка при изменении статуса публикации')
  }
}

// Функция для получения текущего месяца тоже через dayjs:
function getCurrentMonth() {
  return dayjs().format('YYYY-MM')
}
</script>

<style scoped>
/* Component styles here */
</style>
