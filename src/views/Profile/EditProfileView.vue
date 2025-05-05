<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto px-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p class="mt-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          All profile information is used for analytics and service improvement. Please note that your
          profile name always remains public.
        </p>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Basic Info Section -->
        <div class="bg-white rounded-lg border p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">Basic Information</h2>

          <!-- Name Fields Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Input
              v-model="formData.nickname"
              label="Nickname *"
              :error="getFieldError('nickname')"
              @blur="validateField('nickname')"
            />
            <Input
              v-model="formData.fullName"
              type="text"
              label="Full Name *"
              placeholder="Enter your full name"
              :error="getFieldError('fullName')"
              @blur="validateField('fullName')"
            />
          </div>

          <!-- Gender and Birth Date Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Select
              v-model="formData.gender"
              label="Gender *"
              :options="[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]"
              :error="getFieldError('gender')"
              @blur="validateField('gender')"
            />
            <Input
              v-model="formData.birthDate"
              type="date"
              label="Date of Birth *"
              :error="getFieldError('birthDate')"
              @blur="validateField('birthDate')"
            />
          </div>

          <!-- About Me Field -->
          <div class="mb-6 relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              About Me
            </label>
            <div class="relative">
              <textarea
                v-model="formData.aboutMe"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': getFieldError('aboutMe') }"
                placeholder="Tell us about yourself..."
                maxlength="500"
                @blur="validateField('aboutMe')"
              ></textarea>
              <button
                type="button"
                @click.prevent="toggleEmojiPicker"
                class="absolute right-2 bottom-2 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <Icon icon="mdi:emoji-outline" class="w-5 h-5" />
              </button>
            </div>
            <div class="mt-1 flex justify-between">
              <p v-if="getFieldError('aboutMe')" class="text-sm text-red-500">
                {{ getFieldError('aboutMe') }}
              </p>
              <p class="text-sm text-gray-500">
                {{ formData.aboutMe?.length || 0 }}/500
              </p>
            </div>

            <!-- Emoji Picker -->
            <div
              v-show="showEmojiPicker"
              class="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div class="p-2">
                <div class="grid grid-cols-8 gap-1">
                  <button
                    v-for="emoji in commonEmojis"
                    :key="emoji"
                    type="button"
                    @click.prevent="onEmojiSelect(emoji)"
                    class="p-1 hover:bg-gray-100 rounded text-xl"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Field -->
          <div class="mb-6">
            <LocationInput
              v-model="formData.location"
              label="Location *"
              placeholder="Start typing your location..."
              :error="getFieldError('location')"
              @location-selected="handleLocationSelected"
            />
          </div>
        </div>

        <!-- Contact Info Section -->
        <div class="bg-white rounded-lg border p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">Contact Information</h2>
          <div class="grid grid-cols-1 gap-6">
            <!-- Email -->
            <div class="flex-grow">
              <Input
                v-model="formData.email"
                type="email"
                label="Email *"
                placeholder="your@email.com"
                :error="getFieldError('email')"
                @blur="validateField('email')"
              />
            </div>

            <!-- Phone -->
            <div class="flex-grow">
              <Input
                v-model="formData.phone"
                type="tel"
                label="Phone *"
                placeholder="+1 (234) 567-8900"
                :error="getFieldError('phone')"
                @blur="validateField('phone')"
                mask="+#(###)###-####"
              />
            </div>

            <!-- Website -->
            <div class="flex-grow">
              <Input
                v-model="formData.website"
                type="text"
                label="Website"
                placeholder="example.com"
                :error="getFieldError('website')"
                @blur="handleWebsiteBlur"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >{{ t('common.cancel') }}</button>

          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >{{ loading ? t('common.saving') : t('common.save') }}</button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { withI18nMessage, customValidators, normalizeUrl } from '@/utils/validation'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/UserStore'
import MainLayout from '@/layouts/MainLayout.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import LocationInput from '@/components/ui/LocationInput.vue'
import { Icon } from '@iconify/vue'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const loading = ref(false)

const formData = ref({
  fullName: userStore.userData?.fullName || '',
  nickname: userStore.userData?.nickname || '',
  gender: userStore.userData?.gender || '',
  birthDate: userStore.userData?.birthDate || '',
  aboutMe: userStore.userData?.aboutMe || '',
  location: userStore.userData?.location?.fullAddress || '',
  locationData: userStore.userData?.location || null,
  email: userStore.userData?.contactEmail || '',
  phone: userStore.userData?.phone || '',
  website: userStore.userData?.website || ''
})

// Добавляем валидатор для телефона
const phoneValidator = (value) => {
  if (!value) return true
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly.length >= 10
}

// Validation rules
const rules = computed(() => ({
  fullName: { required: withI18nMessage(required, 'required') },
  nickname: { required: withI18nMessage(required, 'required') },
  gender: { required: withI18nMessage(required, 'required') },
  birthDate: { required: withI18nMessage(required, 'required') },
  location: {
    required: withI18nMessage((value) => {
      return value && value.trim().length > 0
    }, 'required'),
  },
  email: {
    required: withI18nMessage(required, 'required'),
    email: withI18nMessage(customValidators.email, 'email'),
  },
  phone: {
    required: withI18nMessage(required, 'required'),
    validFormat: withI18nMessage(phoneValidator, 'phoneFormat'),
  },
  website: {
    url: withI18nMessage((value) => {
      if (!value) return true // Пустое значение разрешено
      const normalizedUrl = normalizeUrl(value)
      return customValidators.url(normalizedUrl)
    }, 'url'),
  },
  aboutMe: {
    maxLength: withI18nMessage(
      (value) => !value || value.length <= 500,
      'maxLength',
      { max: 500 }
    )
  },
}))

const v$ = useVuelidate(rules, formData)

// Validate single field
const validateField = async (fieldName) => {
  if (fieldName === 'location') {
    await v$.value[fieldName].$touch()
    const result = !v$.value[fieldName].$error
    return result
  }
  await v$.value[fieldName].$touch()
  const result = !v$.value[fieldName].$error
  return result
}

// Get field error message
const getFieldError = (fieldName) => {
  if (v$.value[fieldName].$error) {
    return v$.value[fieldName].$errors[0].$message
  }
  return ''
}

// Обработчик для нормализации URL при потере фокуса
const handleWebsiteBlur = () => {
  if (formData.value.website && typeof formData.value.website === 'string') {
    formData.value.website = normalizeUrl(formData.value.website)
  }
}

const handleLocationSelected = (locationData) => {
  formData.value.location = locationData.fullAddress
  formData.value.locationData = {
    fullAddress: locationData.fullAddress,
    coordinates: locationData.coordinates,
    components: locationData.components
  }
}

const handleSubmit = async () => {
  if (loading.value) return

  loading.value = true

  try {
    const isValid = await v$.value.$validate()
    if (!isValid) {
      toast.error(t('validation.general_error'))
      return
    }

    const updateData = {
      fullName: formData.value.fullName,
      nickname: formData.value.nickname,
      gender: formData.value.gender,
      birthDate: formData.value.birthDate,
      aboutMe: formData.value.aboutMe,
      contactEmail: formData.value.email,
      phone: formData.value.phone,
      website: formData.value.website,
      location: {
        fullAddress: formData.value.location,
        coordinates: formData.value.locationData?.coordinates || null,
        components: formData.value.locationData?.components || null
      }
    }

    const result = await userStore.updateUserData(updateData)
    if (result?.success) {
      toast.success(result.message || t('profile.update_success'))
      router.push('/profile')
    } else {
      toast.error(result?.error || t('profile.update_error'))
    }
  } catch (error) {
    toast.error(t('profile.update_error'))
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/profile')
}

// Массив часто используемых эмодзи
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
  '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
  '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
  '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒',
  '❤️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙'
]

const showEmojiPicker = ref(false)

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const onEmojiSelect = (emoji) => {
  const textarea = document.querySelector('textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  formData.value.aboutMe =
    formData.value.aboutMe.substring(0, start) +
    emoji +
    formData.value.aboutMe.substring(end)

  showEmojiPicker.value = false
}

// Добавляем обработчик клика вне пикера
const handleClickOutside = (event) => {
  const picker = document.querySelector('.emoji-picker')
  const button = document.querySelector('.emoji-button')
  if (showEmojiPicker.value && picker && !picker.contains(event.target) && !button?.contains(event.target)) {
    showEmojiPicker.value = false
  }
}

// Инициализация данных при монтировании компонента
onMounted(async () => {
  if (!userStore.userData) {
    await userStore.fetchUserData()
  }
  // Обновляем formData после получения данных
  formData.value = {
    fullName: userStore.userData?.fullName || '',
    nickname: userStore.userData?.nickname || '',
    gender: userStore.userData?.gender || '',
    birthDate: userStore.userData?.birthDate || '',
    aboutMe: userStore.userData?.aboutMe || '',
    location: userStore.userData?.location?.fullAddress || '',
    locationData: userStore.userData?.location || null,
    email: userStore.userData?.contactEmail || '',
    phone: userStore.userData?.phone || '',
    website: userStore.userData?.website || ''
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Добавляем стили для textarea при фокусе */
textarea:focus {
  @apply outline-none ring-2 ring-blue-500 border-blue-500;
}

/* Добавляем стили для эмодзи */
.emoji-picker {
  max-height: 200px;
  overflow-y: auto;
}

.emoji-picker button {
  transition: all 0.2s;
}

.emoji-picker button:hover {
  transform: scale(1.1);
}
</style>
