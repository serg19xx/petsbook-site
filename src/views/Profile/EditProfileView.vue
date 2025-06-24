<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto px-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('UI.editprofile.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          {{ $t('UI.editprofile.description') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Basic Info Section -->

        <div class="bg-white rounded-lg border p-6 mb-6">
          <!-- Name Fields Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Input
              v-model="formData.nickname"
              type="text"
              :label="'UI.editprofile.fields.nickname'"
              :error="getFieldError('nickname')"
              @blur="validateField('nickname')"
            />
            <Input
              v-model="formData.fullName"
              type="text"
              :label="'UI.editprofile.fields.full_name'"
              placeholder="Enter your full name"
              :error="getFieldError('fullName')"
              @blur="validateField('fullName')"
            />
          </div>

          <!-- Gender and Birth Date Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <Select
                v-model="formData.gender"
                :label="'UI.editprofile.fields.gender'"
                :options="[
                  { value: 'male', label: $t('UI.editprofile.fields.gender-options.male') },
                  { value: 'female', label: $t('UI.editprofile.fields.gender-options.female') },
                  { value: 'prefer_not_to_say', label: $t('UI.editprofile.fields.gender-options.prefer_not_to_say') }
                ]"
                :error="getFieldError('gender')"
                @blur="validateField('gender')"
              />
            </div>
            <Input
              v-model="formData.birthDate"
              type="date"
              :label="'UI.editprofile.fields.birth_date'"
              :error="getFieldError('birthDate')"
              @blur="validateField('birthDate')"
            />
          </div>

          <!-- About Me Field -->
          <div class="mb-6 relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('UI.editprofile.fields.about_me') }}
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
              :initial-value="formData.location"
              :label="'UI.editprofile.fields.location'"
              placeholder="Start typing your location..."
              :error="getFieldError('location')"
              @location-selected="handleLocationSelected"
            />
          </div>
        </div>

        <!-- Contact Info Section -->
        <div class="bg-white rounded-lg border p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">{{ $t('UI.editprofile.fields.email') }}</h2>
          <div class="grid grid-cols-1 gap-6">
            <!-- Email -->
            <div class="flex-grow">
              <Input
                v-model="formData.email"
                type="email"
                :label="'UI.editprofile.fields.contact_email'"
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
                :label="'UI.editprofile.fields.phone'"
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
                :label="'UI.editprofile.fields.website'"
                placeholder="example.com"
                :error="getFieldError('website')"
                @blur="handleWebsiteBlur"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4">
          <Button
            type="button"
            @click="handleCancel"
            severity="secondary"
            :label="$t('UI.editprofile.button.cancel')"
          />

          <Button
            type="submit"
            :loading="loading"
            severity="primary"
            :label="$t(loading ? 'UI.editprofile.button.saving' : 'UI.editprofile.button.save')"
          />
        </div>
      </form>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { withI18nMessage, customValidators, normalizeUrl } from '@/utils/validation'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/UserStore'
import MainLayout from '@/layouts/MainLayout.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import LocationInput from '@/components/ui/LocationInput.vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/LanguageStore'
import i18n from '@/i18n'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const userStore = useUserStore()
const { t, messages } = useI18n()
const languageStore = useLanguageStore()

console.log('EditProfileView mounted')

const loading = ref(false)
const formSubmitted = ref(false)

const formData = ref({
  nickname: '',
  fullName: '',
  aboutMe: '',
  gender: 'male',
  birthDate: '',
  location: '',
  contactEmail: '',
  phone: '',
  website: ''
})

const genderLabel = computed(() => t('UI.editprofile.fields.gender'))
const genderOptions = computed(() => [
  { value: 'male', label: t('UI.editprofile.fields.gender.male') },
  { value: 'female', label: t('UI.editprofile.fields.gender.female') },
  { value: 'prefer_not_to_say', label: t('UI.editprofile.fields.gender.prefer_not_to_say') }
])

// Добавляем валидатор для телефона
const phoneValidator = (value) => {
  if (!value) return true
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly.length >= 10
}


// Validation rules
const rules = computed(() => ({
  fullName: { required: withI18nMessage(required, 'VALIDATION.required') },
  nickname: { required: withI18nMessage(required, 'VALIDATION.required') },
  gender: { required: withI18nMessage(required, 'VALIDATION.required') },
  birthDate: { required: withI18nMessage(required, 'VALIDATION.required') },
  location: { required: withI18nMessage(required, 'VALIDATION.required') },
  email: { required: withI18nMessage(required, 'VALIDATION.required'), email: withI18nMessage(email, 'VALIDATION.email') },
  phone: { required: withI18nMessage(required, 'VALIDATION.required') },
  website: { url: customValidators.url },
  aboutMe: { maxLength: (value) => !value || value.length <= 500 },
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

// Изменим функцию getFieldError
const getFieldError = (fieldName) => {
  const fieldState = v$.value[fieldName]
  if (!fieldState) return ''
  if (!formSubmitted.value && !fieldState.$dirty) return ''
  if (fieldState.$error) {
    const errors = fieldState.$errors
    if (errors && errors.length > 0) {
      const error = errors[0]
      return error.$message
    }
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
  formSubmitted.value = true

  try {
    const isValid = await v$.value.$validate()
    if (!isValid) {
      v$.value.$touch()
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

    if (result.success) {
      await userStore.fetchUserData()
      toast.success(t('UI.editprofile.success'))
      //router.push('/profile')
    } else {
      toast.error(t('UI.editprofile.error'))
    }
  } catch (error) {
    //console.error('Error updating profile:', error)
    toast.error(t('UI.editprofile.error'))
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  formSubmitted.value = false
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

// Следим за изменениями переводов
watch(() => languageStore.translations, (newTranslations) => {
  console.log('=== DEBUG COMPONENT TRANSLATIONS ===')
  console.log('1. Available messages:', messages.value)
  console.log('2. UI messages:', messages.value?.UI)
  console.log('3. Edit profile messages:', messages.value?.UI?.editprofile)
  console.log('4. Test translation:', t('UI.editprofile.fields.gender.gender'))
  console.log('5. Current locale:', i18n.global.locale.value)
  console.log('6. Store translations:', languageStore.translations)
  console.log('==================================')
}, { immediate: true })

// Инициализация данных при монтировании компонента
onMounted(async () => {
  console.log('EditProfileView onMounted')
  if (!languageStore.isLoaded) {
    await languageStore.setLanguage(languageStore.currentLanguage)
  }

  await userStore.fetchUserData()
  const userData = userStore.userData
  console.log('======userData:', userData)

  formData.value = {
    fullName: userData.fullName || '',
    nickname: userData.nickname || '',
    gender: userData.gender ? userData.gender.toLowerCase() : 'male',
    birthDate: userData.birthDate || '',
    aboutMe: userData.aboutMe || '',
    location: userData.location?.fullAddress || '',
    locationData: userData.location || null,
    email: userData.contactEmail || '',
    phone: userData.phone || '',
    website: userData.website || ''
  }

  await nextTick()

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => getFieldError('fullName'), (val) => {
  console.log('getFieldError(fullName) changed:', val)
})
</script>

<style scoped lang="postcss">
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
