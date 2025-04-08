birthDate: "2025-04-08" birthDatePrivate: false email: "serg.kostyuk@gmail.com" emailPrivate: false
fullName: "asD" websitePrivate: false

<template>
  <MainLayout>
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p class="mt-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          All profile information is used for analytics and service improvement. You can control the
          visibility of each field to other users by marking it as "Private". Please note that your
          profile name always remains public.
        </p>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Basic Info Section -->
        <div class="bg-white rounded-lg border p-6 mb-6">
          <!-- Removed shadow, added border -->
          <h2 class="text-lg font-semibold mb-4">Basic Information</h2>
          <div class="grid grid-cols-1 gap-6">
            <!-- Nickname first -->
            <Input
              v-model="formData.nickname"
              label="Nickname *"
              :error="getFieldError('nickname')"
              @blur="validateField('nickname')"
            />

            <!-- Full Name second -->
            <Input
              v-model="formData.fullName"
              type="text"
              label="Full Name *"
              placeholder="Enter your full name"
              :error="getFieldError('fullName')"
              @blur="validateField('fullName')"
            />

            <!-- Gender -->
            <div class="flex gap-4 items-start">
              <div class="flex-grow">
                <Select
                  v-model="formData.gender"
                  label="Gender *"
                  :options="[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]"
                  :error="getFieldError('gender')"
                  @blur="validateField('gender')"
                />
              </div>
              <div class="mt-7">
                <PrivacyToggle v-model="formData.genderPrivate" :showLabels="false" />
              </div>
            </div>

            <!-- Birth Date -->
            <div class="flex gap-4 items-start">
              <div class="flex-grow">
                <Input
                  v-model="formData.birthDate"
                  type="date"
                  label="Date of Birth *"
                  :error="getFieldError('birthDate')"
                  @blur="validateField('birthDate')"
                />
              </div>
              <div class="mt-7">
                <PrivacyToggle v-model="formData.birthDatePrivate" :showLabels="false" />
              </div>
            </div>

            <!-- Location -->
            <div class="flex gap-4 items-start">
              <div class="flex-grow">
                <LocationInput
                  v-model="formData.location"
                  label="Location *"
                  placeholder="Start typing your location..."
                  :error="getFieldError('location')"
                  @location-selected="handleLocationSelected"
                />
              </div>
              <div class="mt-7">
                <PrivacyToggle v-model="formData.locationPrivate" :showLabels="false" />
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Info Section -->
        <div class="bg-white rounded-lg border p-6 mb-6">
          <!-- Removed shadow, added border -->
          <h2 class="text-lg font-semibold mb-4">Contact Information</h2>
          <div class="grid grid-cols-1 gap-6">
            <!-- Email -->
            <div class="flex gap-4 items-start">
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
              <div class="mt-7">
                <PrivacyToggle v-model="formData.emailPrivate" :showLabels="false" />
              </div>
            </div>

            <!-- Phone -->
            <div class="flex gap-4 items-start">
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
              <div class="mt-7">
                <PrivacyToggle v-model="formData.phonePrivate" :showLabels="false" />
              </div>
            </div>

            <!-- Website -->
            <div class="flex gap-4 items-start">
              <div class="flex-grow">
                <Input
                  v-model="formData.website"
                  type="text"
                  label="Website *"
                  placeholder="example.com"
                  :error="getFieldError('website')"
                  @blur="handleWebsiteBlur"
                />
              </div>
              <div class="mt-7">
                <PrivacyToggle v-model="formData.websitePrivate" :showLabels="false" />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { withI18nMessage, customValidators, normalizeUrl } from '@/utils/validation'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import MainLayout from '@/layouts/MainLayout.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import LocationInput from '@/components/ui/LocationInput.vue'
import PrivacyToggle from '@/components/ui/PrivacyToggle.vue'

const router = useRouter()
const { t } = useI18n()

const formData = ref({
  fullName: '',
  nickname: '',
  nicknamePrivate: false,
  gender: '',
  genderPrivate: false,
  birthDate: '',
  birthDatePrivate: false,
  location: '',
  locationData: null, // Будет хранить полные данные о местоположении
  locationPrivate: false,
  email: '',
  emailPrivate: false,
  phone: '',
  phonePrivate: false,
  website: '',
  websitePrivate: false,
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
    required: withI18nMessage(required, 'required'),
    url: withI18nMessage((value) => {
      // Проверяем URL после нормализации
      const normalizedUrl = normalizeUrl(value)
      return customValidators.url(normalizedUrl)
    }, 'url'),
  },
}))

const v$ = useVuelidate(rules, formData)

// Validate single field
const validateField = async (fieldName) => {
  if (fieldName === 'location') {
    // Проверяем наличие значения перед валидацией
    if (!formData.value.location || formData.value.location.trim() === '') {
      v$.value[fieldName].$touch()
      return false
    }
  }
  await v$.value[fieldName].$touch()
  return !v$.value[fieldName].$error
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
    console.log('Website normalized:', formData.value.website)
  }
}

const handleLocationSelected = (locationData) => {
  // Устанавливаем значение в поле location
  formData.value.location = locationData.fullAddress || locationData.display_name

  // Сохраняем дополнительные данные о местоположении, если они нужны
  formData.value.locationData = {
    coordinates: locationData.coordinates,
    components: locationData.components,
    placeType: locationData.placeType,
    bbox: locationData.bbox,
  }

  // Валидируем поле после выбора
  validateField('location')
}

// Добавим watch для отладки, если нужно
watch(
  () => formData.value.location,
  (newValue) => {
    console.log('Location changed:', newValue)
  },
)

const handleSubmit = async () => {
  if (formData.value.website) {
    formData.value.website = normalizeUrl(formData.value.website)
  }

  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) {
    toast.error(t('validation.general_error'))
    return
  }

  try {
    // Формируем данные для отправки в правильном формате
    const dataToSubmit = {
      fullName: formData.value.fullName,
      nickname: formData.value.nickname,
      nicknamePrivate: formData.value.nicknamePrivate,
      gender: formData.value.gender,
      genderPrivate: formData.value.genderPrivate,
      birthDate: formData.value.birthDate,
      birthDatePrivate: formData.value.birthDatePrivate,
      email: formData.value.email,
      emailPrivate: formData.value.emailPrivate,
      phone: formData.value.phone,
      phonePrivate: formData.value.phonePrivate,
      website: formData.value.website,
      websitePrivate: formData.value.websitePrivate,
      location: {
        fullAddress: formData.value.location,
        ...formData.value.locationData,
        isPrivate: formData.value.locationPrivate,
      },
    }

    console.log('Form data to submit:', dataToSubmit)
    // TODO: Implement API call to update profile
    toast.success(t('notifications.profile.update_success'))
    router.push('/profile')
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error(t('notifications.profile.update_error'))
  }
}

const handleCancel = () => {
  router.push('/profile')
}

// Добавляем наблюдение за изменениями website
watch(
  () => formData.value.website,
  (newValue) => {
    if (typeof newValue === 'string') {
      console.log('Website changed:', newValue)
    }
  },
)
</script>
