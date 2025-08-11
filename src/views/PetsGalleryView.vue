<template>
  <MainLayout>
    <template #default>
      <!-- Gallery View -->
      <div v-if="currentView === 'gallery'">
        <!-- Toolbar -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 mb-8 shadow-sm">
          <div class="flex items-center justify-between">
            <!-- Stats -->
            <div class="flex items-center gap-6 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:paw" class="w-4 h-4 text-blue-600" />
                </div>
                <span class="font-medium">{{ pets.length }} {{ $t('UI.petsgallery.pets_found', { count: pets.length }) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <!-- Filter Button -->
              <button
                @click="showFilterDialog = true"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium',
                  activeFiltersCount > 0
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
              >
                <Icon icon="mdi:filter-variant" class="w-4 h-4" />
                <span class="hidden sm:inline">{{ $t('UI.petsgallery.button.filters') }}</span>
                <span
                  v-if="activeFiltersCount > 0"
                  class="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {{ activeFiltersCount }}
                </span>
              </button>

              <!-- Sort Button -->
              <button
                @click="showSortDialog = true"
                class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium"
              >
                <Icon icon="mdi:sort-variant" class="w-4 h-4" />
                <span class="hidden sm:inline">{{ $t('UI.common.sort') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="flex items-center gap-2 text-gray-600">
            <Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
            {{ $t('UI.petsgallery.loading') }}
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800">
            <Icon icon="mdi:alert-circle" class="w-5 h-5" />
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="pets.length === 0" class="text-center py-12">
          <Icon icon="mdi:paw" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('UI.petsgallery.no_pets_found') }}</h3>
          <p class="text-gray-600">{{ $t('UI.petsgallery.no_pets_description') }}</p>
        </div>

        <!-- Pets Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <PetCard
            v-for="pet in pets"
            :key="pet.id"
            :pet="pet"
            :is-logged-in="isLoggedIn"
            @like="handleLike"
            @comment="handleComment"
            @view="handleViewPet"
          />
        </div>

        <!-- Load More Button -->
        <div v-if="hasMore && !loading && pets.length > 0" class="flex justify-center mt-12">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-md"
          >
            <Icon v-if="loadingMore" icon="mdi:loading" class="w-5 h-5 animate-spin" />
            <span class="font-medium">{{ loadingMore ? $t('UI.petsgallery.loading') : $t('UI.petsgallery.load_more') }}</span>
          </button>
        </div>
      </div>

            <!-- Pet Detail View -->
      <div v-else-if="currentView === 'detail' && selectedPet" class="max-w-4xl mx-auto">
        <!-- Header with Back Button -->
        <div class="flex items-center justify-between mb-6">
          <button
            @click="closePetDetail"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon icon="mdi:arrow-left" class="w-5 h-5" />
            <span>{{ $t('UI.petsgallery.back_to_gallery') }}</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              @click="handleLike"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                selectedPet.isLiked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ]"
            >
              <Icon
                :icon="selectedPet.isLiked ? 'mdi:heart' : 'mdi:heart-outline'"
                class="w-5 h-5"
              />
              <span>{{ selectedPet.likes }}</span>
            </button>
          </div>
        </div>

        <!-- Pet Detail Content -->
        <div class="space-y-6">
          <!-- Pet Header -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-start justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ selectedPet?.name || 'sdfsdfs' }}</h1>
                <p class="text-lg text-gray-600">{{ selectedPet?.breed || '---' }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ selectedPet?.location || '---' }} • {{ selectedPet?.distance || '---' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Photo Gallery -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('UI.petsgallery.photos') }}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(photo, index) in selectedPet?.photos || []"
                :key="index"
                class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                @click="openPhotoGallery(index)"
              >
                <img
                  :src="photo"
                  :alt="`${selectedPet?.name || $t('UI.petsgallery.unnamed_pet')} ${$t('UI.petsgallery.photo')} ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <!-- Pet Information -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('UI.petsgallery.pet_information') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-medium text-gray-900 mb-2">{{ $t('UI.petsgallery.basic_information') }}</h3>
                <dl class="space-y-2">
                  <div class="flex justify-between">
                    <dt class="text-gray-600">{{ $t('UI.petsgallery.fields.species') || '---' }}:</dt>
                    <dd class="font-medium">{{ selectedPet.species }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">{{ $t('UI.petsgallery.fields.breed') || '---' }}:</dt>
                    <dd class="font-medium">{{ selectedPet.breed }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">{{ $t('UI.petsgallery.fields.gender') || '---' }}:</dt>
                    <dd class="font-medium">
                      {{ selectedPet.gender }}
                    </dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">{{ $t('UI.petsgallery.fields.age') }}:</dt>
                    <dd class="font-medium">{{ selectedPet.age || '---' }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">{{ $t('UI.petsgallery.fields.color') }}:</dt>
                    <dd class="font-medium">{{ selectedPet.color || '---' }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-600">{{ $t('UI.petsgallery.fields.size') }}:</dt>
                    <dd class="font-medium">{{ selectedPet.size || '---' }}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 class="font-medium text-gray-900 mb-2">{{ $t('UI.petsgallery.owner') }}</h3>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    :src="selectedPet?.owner?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNlNWU3ZWIiLz4KPHBhdGggZD0iTTI0IDEyQzI2LjYyOTEgMTIgMjggMTMuMzcxIDI4IDE2QzI4IDE4LjYyOTEgMjYuNjI5MSAyMCAyNCAyMEMyMS4zNzEgMjAgMjAgMTguNjI5MSAyMCAxNkMyMCAxMy4zNzEgMjEuMzcxIDEyIDI0IDEyWk0zMiAzNkMzMiAzMi42ODYzIDI5LjMxMzcgMzAgMjYgMzBIMjJDMTguNjg2MyAzMCAxNiAzMi42ODYzIDE2IDM2SDMyWiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K'"
                    class="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p class="font-medium text-gray-900">{{ selectedPet?.owner?.name || '---' }}</p>
                    <p class="text-sm text-gray-600">{{ selectedPet?.location || '---' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments View -->
      <div
        v-else-if="currentView === 'comments' && selectedPetForComments"
        class="max-w-2xl mx-auto"
      >
        <!-- Header with Back Button -->
        <div class="flex items-center justify-between mb-6">
          <button
            @click="closeComments"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon icon="mdi:arrow-left" class="w-5 h-5" />
            <span>{{ $t('UI.petsgallery.back_to_gallery') }}</span>
          </button>
        </div>

        <!-- Comments Content -->
        <div class="space-y-6">
          <!-- Pet Info Header -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-4">
              <img
                :src="selectedPetForComments?.photos?.[0] || 'https://via.placeholder.com/64x64?text=No+Photo'"
                :alt="selectedPetForComments?.name || $t('UI.petsgallery.unnamed_pet')"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ selectedPetForComments?.name || 'Unnamed Pet' }}</h1>
                <p class="text-gray-600">{{ selectedPetForComments?.breed || 'Unknown Breed' }}</p>
                <p class="text-sm text-gray-500">{{ selectedPetForComments?.comments || 0 }} {{ $t('UI.petsgallery.comments') }}</p>
              </div>
            </div>
          </div>

          <!-- Comment Form (for logged in users) -->
          <div v-if="isLoggedIn" class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('UI.petsgallery.add_comment') }}</h2>

            <!-- User info row -->
            <div class="flex items-center gap-3 mb-3">
              <img :src="currentUserAvatar" class="w-10 h-10 rounded-full flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900 truncate">{{ currentUserName }}</p>
                <p class="text-sm text-gray-500 truncate">{{ userStore.userData?.email }}</p>
              </div>
            </div>

            <!-- Comment textarea -->
            <div class="mt-4">
              <textarea
                v-model="newComment"
                rows="3"
                :placeholder="$t('UI.petsgallery.comment_placeholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="addComment"
                  :disabled="!newComment.trim()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
                >
                  {{ $t('UI.petsgallery.post_comment') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Comments List -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('UI.petsgallery.comments') }}</h2>

            <div v-if="commentsLoading" class="flex justify-center py-8">
              <div class="flex items-center gap-2 text-gray-600">
                <Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
                {{ $t('UI.petsgallery.loading') }}
              </div>
            </div>

            <div v-else-if="comments.length === 0" class="text-center py-8">
              <Icon icon="mdi:comment-outline" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-500">{{ $t('UI.petsgallery.no_comments') }}</p>
              <p class="text-sm text-gray-400 mt-1">{{ $t('UI.petsgallery.be_the_first_to_comment') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  :src="comment.author.avatar"
                  class="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-gray-900">{{ comment.author.name }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(comment.date) }}</span>
                  </div>
                  <p class="text-gray-700 leading-relaxed">{{ comment.text }}</p>

                  <!-- Comment Actions -->
                  <div class="flex items-center gap-4 mt-3 text-sm">
                    <button
                      @click="handleLikeComment(comment)"
                      :class="[
                        'flex items-center gap-1 transition-colors',
                        comment.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600',
                      ]"
                    >
                      <Icon
                        :icon="comment.isLiked ? 'mdi:heart' : 'mdi:heart-outline'"
                        class="w-4 h-4"
                      />
                      <span>{{ comment.likes || 0 }}</span>
                    </button>

                    <button
                      @click="handleReply(comment)"
                      class="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Icon icon="mdi:reply" class="w-4 h-4" />
                      <span>{{ $t('UI.petsgallery.reply') }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Dialog -->
      <Dialog
        :model-value="showFilterDialog"
        @close="showFilterDialog = false"
        :title="$t('UI.petsgallery.filters.title')"
        size="md"
      >
        <div class="space-y-6 px-4 py-2">
          <!-- Species Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('UI.petsgallery.fields.species') }}</label>
            <select
              v-model="filters.species"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ $t('UI.petsgallery.filters.all_species') }}</option>
              <option
                v-for="species in petSpeciesOptionsWithFallback"
                :key="species.value"
                :value="species.value"
                :disabled="species.disabled"
              >
                {{ species.displayLabel }}
              </option>
            </select>
          </div>

          <!-- Gender Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('UI.petsgallery.fields.gender') }}</label>
            <select
              v-model="filters.gender"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ $t('UI.petsgallery.filters.all_genders') }}</option>
              <option value="Boy">{{ $t('UI.petsgallery.genders.boy') }}</option>
              <option value="Girl">{{ $t('UI.petsgallery.genders.girl') }}</option>
            </select>
          </div>

          <!-- Age Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('UI.petsgallery.filters.age') }}</label>
            <select
              v-model="filters.age"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ $t('UI.petsgallery.filters.all_ages') }}</option>
              <option value="young">{{ $t('UI.petsgallery.ages.young') }}</option>
              <option value="adult">{{ $t('UI.petsgallery.ages.adult') }}</option>
              <option value="senior">{{ $t('UI.petsgallery.ages.senior') }}</option>
            </select>
          </div>

          <!-- Location Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('UI.petsgallery.filters.location') }}</label>
            <div class="flex items-center gap-2">
              <input
                v-model="filters.location"
                type="text"
                :placeholder="$t('UI.petsgallery.fields.location_placeholder')"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                @click="useCurrentLocation"
                class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                :title="$t('UI.petsgallery.fields.use_current_location')"
              >
                <Icon icon="mdi:crosshairs-gps" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Search Radius -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('UI.petsgallery.fields.radius_km', { radius: filters.radius }) }}
            </label>
            <input
              v-model="filters.radius"
              type="range"
              min="1"
              max="100"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <!-- Clear Filters -->
          <div v-if="activeFiltersCount > 0" class="pt-4 border-t border-gray-200">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              {{ $t('UI.petsgallery.filters.clear') }}
            </button>
          </div>
        </div>

        <!-- Dialog Actions -->
        <template #footer>
          <div class="flex justify-end gap-3 px-4 py-2">
            <button
              @click="showFilterDialog = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {{ $t('UI.common.cancel') }}
            </button>
            <button
              @click="applyFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('UI.common.apply') }}
            </button>
          </div>
        </template>
      </Dialog>

      <!-- Sort Dialog -->
      <Dialog :model-value="showSortDialog" @close="showSortDialog = false" :title="$t('UI.common.sort')" size="sm">
        <div class="space-y-3">
          <label
            v-for="option in sortOptions"
            :key="option.value"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="radio"
              :value="option.value"
              v-model="sortBy"
              class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div class="font-medium text-gray-900">{{ option.label }}</div>
              <div class="text-sm text-gray-500">{{ option.description }}</div>
            </div>
          </label>
        </div>

        <!-- Dialog Actions -->
        <template #footer>
          <div class="flex justify-end gap-3">
            <button
              @click="showSortDialog = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {{ $t('UI.common.cancel') }}
            </button>
            <button
              @click="applySort"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ $t('UI.common.apply') }}
            </button>
          </div>
        </template>
      </Dialog>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue3-toastify'
import MainLayout from '@/layouts/MainLayout.vue'
import PetCard from '@/components/Pets/PetCard.vue'
import Dialog from '@/components/ui/Dialog.vue'
import { PET_SPECIES } from '@/constants/petSpecies.js'
import { petsApi } from '@/api/pets'
import { useAuthStore } from '@/stores/AuthStore'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/LanguageStore'

// Stores
const authStore = useAuthStore()
const userStore = useUserStore()

// State
const pets = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const hasMore = ref(true)
const sortBy = ref('newest')
const showFilterDialog = ref(false)
const showSortDialog = ref(false)

// View state
const currentView = ref('gallery')
const selectedPet = ref(null)
const selectedPetForComments = ref(null)
const newComment = ref('')
const comments = ref([])
const commentsLoading = ref(false)

// Filters
const filters = reactive({
  species: '',
  gender: '',
  age: '',
  location: '',
  radius: 10,
  page: 1,
})

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest first', description: 'By date added' },
  { value: 'oldest', label: 'Oldest first', description: 'By date added' },
  { value: 'popular', label: 'Most popular', description: 'By number of likes' },
  { value: 'distance', label: 'By distance', description: 'Nearest pets' },
]

// Computed
const isLoggedIn = computed(() => {
  return authStore.isAuthenticated
})

const currentUserAvatar = computed(() => {
  return userStore.userData?.owner_avatar || userStore.userData?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlNWU3ZWIiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjIwOTEgMTAgMjQgMTEuNzkwOSAyNCAxNEMyNCAxNi4yMDkxIDIyLjIwOTEgMTggMjAgMThDMTcuNzkwOSAxOCAxNiAxNi4yMDkxIDE2IDE0QzE2IDExLjc5MDkgMTcuNzkwOSAxMCAyMCAxMFoiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAyMCAyNEMxNS41ODE3IDI0IDEyIDI2LjY4NjMgMTIgMzBIMjhaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo='
})

const currentUserName = computed(() => {
  return userStore.userData?.full_name || userStore.userData?.nickname || 'Current User'
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.species) count++
  if (filters.gender) count++
  if (filters.age) count++
  if (filters.location) count++
  if (filters.radius !== 10) count++
  return count
})

const petSpeciesOptions = computed(() => PET_SPECIES.getWithPopularFirst())

// Добавьте после импортов
const { t } = useI18n()

// Добавьте простой лог для проверки
console.log('🔍 PetsGalleryView loaded')
console.log(' t function type:', typeof t)
console.log(' Cat translation:', t('UI.const.petspecies.options.cat'))
console.log(' Dog translation:', t('UI.const.petspecies.options.dog'))
console.log('🔍 Fish translation:', t('UI.const.petspecies.options.fish'))
console.log('🔍 Loading translation:', t('UI.petsgallery.loading'))

// Добавьте функцию для проверки i18n
function debugI18n() {
  console.log('🔍 Debugging i18n...')
  console.log('🔍 t function:', typeof t)
  console.log(' Test translation 1:', t('UI.petsgallery.loading'))
  console.log(' Test translation 2:', t('VALIDATION.required'))
  console.log(' Cat translation:', t('UI.const.petspecies.options.cat'))
  console.log(' Dog translation:', t('UI.const.petspecies.options.dog'))
  console.log('🔍 Fish translation:', t('UI.const.petspecies.options.fish'))
  console.log('🔍 Non-existent key:', t('UI.const.petspecies.options.axolotl'))
}

// Вызываем отладку при монтировании
onMounted(() => {
  debugI18n()
})

// Добавьте computed для отладки
const debugPetSpeciesOptions = computed(() => {
  const options = PET_SPECIES.getWithPopularFirst()
  console.log('🔍 Debug petSpeciesOptions:', options)

  return options.map(species => {
    const translatedLabel = t(species.label)
    console.log(`🔍 Translation for "${species.label}": "${translatedLabel}"`)
    return {
      ...species,
      translatedLabel
    }
  })
})

// Добавьте computed для отображения с fallback
const petSpeciesOptionsWithFallback = computed(() => {
  const options = PET_SPECIES.getWithPopularFirst()

  return options.map(species => {
    const translation = t(species.label)
    // Если перевод не найден (возвращается тот же ключ), используем value
    const displayLabel = translation === species.label ? species.value : translation

    // Для отладки
    console.log(` Species: ${species.value}, Label: ${species.label}, Translation: ${translation}, Display: ${displayLabel}`)

    return {
      ...species,
      displayLabel
    }
  })
})

// Methods
async function loadPets(reset = false) {
  if (reset) {
    pets.value = []
    filters.page = 1
    hasMore.value = true
  }

  loading.value = true
  error.value = null

  try {
    // Получаем геолокацию пользователя
    const userLocation = await getCurrentLocation()

    const params = {
      page: filters.page,
      limit: 12, // Количество питомцев на странице
      species: filters.species,
      gender: filters.gender,
      age: filters.age,
      location: filters.location,
      radius: filters.radius,
      sort: sortBy.value,
      // Добавляем координаты пользователя если есть
      ...(userLocation && {
        user_lat: userLocation.lat,
        user_lng: userLocation.lng
      })
    }

    console.log('🔍 Loading pets with params:', params)

    // Используем реальный API
    const response = await petsApi.fetchPublicPets(params)

    console.log('✅ API response:', response)
    console.log('✅ API response type:', typeof response)
    console.log('✅ API response keys:', Object.keys(response || {}))

    // Детальный анализ структуры ответа
    if (response) {
      console.log('�� Response structure analysis:')
      console.log('  - response.pets:', response.pets)
      console.log('  - response.data:', response.data)
      console.log('  - response.data?.pets:', response.data?.pets)
      console.log('  - response.data?.data:', response.data?.data)
      console.log('  - response.data?.data?.pets:', response.data?.data?.pets)
    }

    // Попробуем разные варианты структуры ответа
    let petsData = null
    let hasMoreData = false

    if (response?.pets) {
      // Формат: { pets: [...], hasMore: true }
      petsData = response.pets
      hasMoreData = response.hasMore ?? false
      console.log('📋 Using format: response.pets')
    } else if (response?.data?.pets) {
      // Формат: { data: { pets: [...], hasMore: true } }
      petsData = response.data.pets
      hasMoreData = response.data.hasMore ?? false
      console.log('📋 Using format: response.data.pets')
    } else if (response?.data?.data?.pets) {
      // Формат: { data: { data: { pets: [...] } } }
      petsData = response.data.data.pets
      hasMoreData = response.data.data.hasMore ?? false
      console.log('📋 Using format: response.data.data.pets')
    } else if (Array.isArray(response?.data)) {
      // Формат: { data: [...] } (массив питомцев напрямую)
      petsData = response.data
      hasMoreData = false // Нет информации о пагинации
      console.log('📋 Using format: response.data (array)')
    } else if (Array.isArray(response)) {
      // Формат: [...] (массив питомцев напрямую)
      petsData = response
      hasMoreData = false
      console.log('📋 Using format: response (array)')
    }

    console.log('📊 Final extracted data:', {
      petsCount: petsData?.length || 0,
      hasMore: hasMoreData,
      firstPet: petsData?.[0]
    })

    if (petsData && Array.isArray(petsData)) {
      let newPets = petsData

      // Инициализируем поля лайков если их нет
      newPets = newPets.map(pet => {
        const convertedLiked = convertToBoolean(pet.is_liked)
        console.log(`🐾 Pet ${pet.id}: original is_liked=${pet.is_liked}, converted=${convertedLiked}`)

        // Преобразуем main_photos в photos для компонента
        let photos = []
        if (pet.main_photos && Array.isArray(pet.main_photos)) {
          photos = pet.main_photos.map(photo => {
            // Если URL относительный, добавляем базовый URL
            if (photo.url && !photo.url.startsWith('http')) {
              return import.meta.env.VITE_API_BASE_URL + photo.url
            }
            return photo.url
          })
        }

        console.log(`📸 Pet ${pet.id} photos:`, photos)

        return {
          ...pet,
          isLiked: convertedLiked,
          likes: pet.likes_count || pet.likes || 0,
          comments: pet.comments || 0,
          photos: photos // Добавляем преобразованные фотографии
        }
      })

      if (reset) {
        pets.value = newPets
      } else {
        pets.value.push(...newPets)
      }

      hasMore.value = hasMoreData
      console.log(`📊 Loaded ${newPets.length} pets, has more: ${hasMore.value}`)
    } else {
      console.error('❌ No valid pets data found in response')
      throw new Error('Invalid response format - no pets data found')
    }

  } catch (err) {
    error.value = 'Error loading pets'
    console.error('❌ Error loading pets:', err)
    toast.error('Failed to load pets')
  } finally {
    loading.value = false
  }
}

// Временная mock функция
async function fetchPetsMock(params) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    pets: [
      {
        id: 229,
        name: 'Whisky',
        species: 'Cat',
        breed: 'Bengal',
        gender: 'Boy',
        age: '2 years',
        location: 'Moscow',
        distance: '2.5 km',
        photos: [
          'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Photo+1',
          'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Photo+2',
          'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Photo+3',
          'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Photo+4',
        ],
        // Инициализируем поля лайков
        likes: 42,
        comments: 8,
        isLiked: false,
        owner: {
          id: 1,
          name: 'John Doe',
          avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=JD',
        },
      },
      {
        id: 230,
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        gender: 'Boy',
        age: '3 years',
        location: 'Moscow',
        distance: '1.2 km',
        photos: [
          'https://via.placeholder.com/300x200/FFA07A/FFFFFF?text=Photo+1',
          'https://via.placeholder.com/300x200/98D8C8/FFFFFF?text=Photo+2',
          'https://via.placeholder.com/300x200/F7DC6F/FFFFFF?text=Photo+3',
          'https://via.placeholder.com/300x200/BB8FCE/FFFFFF?text=Photo+4',
        ],
        likes: 67,
        comments: 12,
        isLiked: false,
        owner: {
          id: 2,
          name: 'Jane Smith',
          avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=JS',
        },
      },
    ],
    hasMore: false,
  }
}

async function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        console.log('📍 User location:', location)
        resolve(location)
      },
      (error) => {
        console.log('Geolocation error:', error.message)
        resolve(null) // Продолжаем без геолокации
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    )
  })
}

async function loadMore() {
  if (loadingMore.value) return

  loadingMore.value = true
  filters.page++

  try {
    await loadPets(false) // false = не сбрасывать существующие данные
  } catch (err) {
    toast.error('Error loading more pets')
    console.error('❌ Error loading more pets:', err)
    filters.page-- // Откатываем страницу при ошибке
  } finally {
    loadingMore.value = false
  }
}

function applyFilters() {
  showFilterDialog.value = false
  loadPets(true)
}

function clearFilters() {
  Object.assign(filters, {
    species: '',
    gender: '',
    age: '',
    location: '',
    radius: 10,
    page: 1,
  })
}

function applySort() {
  showSortDialog.value = false
  // TODO: Implement sorting logic
  console.log('Sorting by:', sortBy.value)
}

function useCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // TODO: Reverse geocoding to get city name
        filters.location = 'Current location'
        toast.success('Location detected')
      },
      (error) => {
        toast.error('Failed to detect location')
        console.error('Geolocation error:', error)
      },
    )
  } else {
    toast.error('Geolocation not supported')
  }
}

async function handleLike(petId) {
  if (!isLoggedIn.value) {
    toast.error('Please log in to like pets')
    return
  }

  console.log('🔍 handleLike called for petId:', petId)

  try {
    // Найдем питомца в массиве
    const petIndex = pets.value.findIndex(p => p.id === petId)
    if (petIndex === -1) {
      console.error('Pet not found:', petId)
      return
    }

    const pet = pets.value[petIndex]
    const originalState = {
      isLiked: pet.isLiked,
      likes: pet.likes
    }

    console.log('📊 Original state:', originalState)

    // Оптимистичное обновление UI
    pet.isLiked = !originalState.isLiked
    pet.likes += pet.isLiked ? 1 : -1

    console.log('📊 After optimistic update:', {
      isLiked: pet.isLiked,
      likes: pet.likes
    })

    // Отправляем запрос на сервер
    const response = await petsApi.togglePetLike(petId)

    console.log('🚨 ПОЛНЫЙ ОТВЕТ СЕРВЕРА:')
    console.log('Raw response object:', response)
    console.log('Response type:', typeof response)
    console.log('Response keys:', Object.keys(response))

    if (response.status) {
      console.log('Response status:', response.status, typeof response.status)
    }

    if (response.data) {
      console.log('Response.data:', response.data)
      console.log('Response.data type:', typeof response.data)
      console.log('Response.data keys:', Object.keys(response.data))

      if (response.data.data) {
        console.log('Response.data.data:', response.data.data)
        console.log('Response.data.data type:', typeof response.data.data)
        console.log('Response.data.data keys:', Object.keys(response.data.data))

        const serverData = response.data.data
        console.log('🔍 ДЕТАЛЬНЫЙ АНАЛИЗ ДАННЫХ СЕРВЕРА:')
        console.log('serverData.liked:', serverData.liked, 'type:', typeof serverData.liked)
        console.log('serverData.action:', serverData.action, 'type:', typeof serverData.action)

        if (serverData.hasOwnProperty('liked')) {
          console.log('Has liked property: true')
        } else {
          console.log('Has liked property: false')
        }

        if (serverData.hasOwnProperty('action')) {
          console.log('Has action property: true')
        } else {
          console.log('Has action property: false')
        }
      }
    }

    // Обрабатываем ответ сервера с правильной структурой
    if (response.status === 200 && response.data) {
      const serverData = response.data

      // Более надёжная конверсия типов - поддерживаем все возможные варианты
      const likedValue = serverData.liked
      let isLiked = false

      // Проверяем все возможные варианты true
      if (likedValue === 1 || likedValue === "1" || likedValue === true || likedValue === "true") {
        isLiked = true
      } else if (likedValue === 0 || likedValue === "0" || likedValue === false || likedValue === "false") {
        isLiked = false
      }

      const action = serverData.action

      console.log('📊 Server data conversion:', {
        originalLiked: serverData.liked,
        likedType: typeof serverData.liked,
        convertedIsLiked: isLiked,
        action: action,
        actionType: typeof action
      })

      // Обновляем состояние на основе ответа сервера
      pet.isLiked = isLiked

      // Количество лайков обновляем на основе действия
      if (action === 'liked') {
        pet.likes = originalState.likes + 1
      } else if (action === 'unliked') {
        pet.likes = Math.max(0, originalState.likes - 1) // Не даем уйти в минус
      }

      console.log('📊 Final state after server response:', {
        isLiked: pet.isLiked,
        likes: pet.likes
      })

      toast.success(action === 'liked' ? 'Like added!' : 'Like removed!')
    } else {
      console.log('🚨 НЕОЖИДАННЫЙ ФОРМАТ ОТВЕТА:')
      console.log('Response status:', response.status)
      console.log('Response.data exists:', !!response.data)
      console.log('Response.data.data exists:', !!response.data?.data)
    }

  } catch (error) {
    console.error('❌ Like error:', error)
    console.log('Error type:', typeof error)
    console.log('Error keys:', Object.keys(error))

    if (error.response) {
      console.log('Error response:', error.response)
      console.log('Error response status:', error.response.status)
      console.log('Error response data:', error.response.data)
    }

    console.log('🔄 Rolling back...')

    // Откатываем оптимистичное обновление при ошибке
    const petIndex = pets.value.findIndex(p => p.id === petId)
    if (petIndex !== -1) {
      const pet = pets.value[petIndex]

      // Возвращаем исходное состояние
      pet.isLiked = originalState.isLiked
      pet.likes = originalState.likes

      console.log('📊 After rollback:', {
        isLiked: pet.isLiked,
        likes: pet.likes
      })
    }

    toast.error('Failed to update like')
  }
}

function handleComment(pet) {
  selectedPetForComments.value = pet
  currentView.value = 'comments'
  loadComments()
}

function handleViewPet(pet) {
  selectedPet.value = pet
  currentView.value = 'detail'
}

function closePetDetail() {
  currentView.value = 'gallery'
  selectedPet.value = null
}

function closeComments() {
  currentView.value = 'gallery'
  selectedPetForComments.value = null
  newComment.value = ''
  comments.value = []
}

async function loadComments() {
  if (!selectedPetForComments.value) return

  commentsLoading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    comments.value = [
      {
        id: 1,
        text: 'What a beautiful pet! I love the photos.',
        author: {
          name: 'Sarah Johnson',
          avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=SJ',
        },
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 3,
        isLiked: false,
      },
      {
        id: 2,
        text: 'Such a cute little one! How old is it?',
        author: {
          name: 'Mike Wilson',
          avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=MW',
        },
        date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        likes: 1,
        isLiked: true,
      },
    ]
  } catch (error) {
    console.error('Error loading comments:', error)
    toast.error('Failed to load comments')
  } finally {
    commentsLoading.value = false
  }
}

async function addComment() {
  if (!newComment.value.trim() || !selectedPetForComments.value) return

  try {
    // Здесь должен быть API запрос для добавления комментария
    // const response = await api.post(`/api/pets/${selectedPetForComments.value.id}/comments`, {
    //   text: newComment.value
    // })

    // Временно добавляем локально для демонстрации
    const comment = {
      id: Date.now(),
      text: newComment.value,
      author: {
        name: currentUserName.value,
        avatar: currentUserAvatar.value,
      },
      date: new Date(),
      likes: 0,
      isLiked: false,
    }

    comments.value.unshift(comment)
    newComment.value = ''
    toast.success('Comment posted!')
  } catch (error) {
    console.error('Error posting comment:', error)
    toast.error('Failed to post comment')
  }
}

function handleLikeComment(comment) {
  if (!isLoggedIn.value) {
    toast.error('Please log in to like comments')
    return
  }

  comment.isLiked = !comment.isLiked
  comment.likes += comment.isLiked ? 1 : -1
  toast.success(comment.isLiked ? 'Comment liked!' : 'Like removed!')
}

function handleReply(comment) {
  if (!isLoggedIn.value) {
    toast.error('Please log in to reply')
    return
  }

  // TODO: Implement reply functionality
  console.log('Reply to comment:', comment.id)
  toast.info('Reply functionality coming soon!')
}

function formatDate(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(date).toLocaleDateString()
}

function openPhotoGallery(index) {
  // TODO: Implement photo gallery modal
  console.log('Open photo gallery at index:', index)
}

// Добавляем в начало скрипта
function convertToBoolean(value) {
  console.log('🔄 convertToBoolean called with:', value, 'type:', typeof value)

  // Конвертируем любое значение в boolean
  if (value === 1 || value === "1" || value === true || value === "true") {
    console.log('✅ Converting to true')
    return true
  }
  console.log('❌ Converting to false')
  return false
}

// Lifecycle
onMounted(() => {
  loadPets(true)
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
