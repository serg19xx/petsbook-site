<template>
  <div class="reset-password-container min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="reset-password-card max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <div class="reset-password-header">
        <h1 class="reset-password-title text-2xl font-bold text-center text-gray-900 mb-2">
          {{ t('auth.reset_password.title') }}
        </h1>
        <p class="reset-password-subtitle text-center text-gray-600 text-sm">
          {{ t('auth.reset_password.subtitle') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="reset-password-form space-y-6" autocomplete="off">
        <Input
          v-model="formData.password"
          type="password"
          :label="t('auth.reset_password.new_password')"
          :error="v$.password.$errors[0]?.$message"
          @blur="v$.password.$touch()"
          class="reset-password-input"
        >
          <template #icon-right>
            <Icon icon="mdi:lock" class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </template>
        </Input>

        <Input
          v-model="formData.confirmPassword"
          type="password"
          :label="t('auth.reset_password.confirm_password')"
          :error="v$.confirmPassword.$errors[0]?.$message"
          @blur="v$.confirmPassword.$touch()"
          class="reset-password-input"
        >
          <template #icon-right>
            <Icon icon="mdi:lock-check" class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </template>
        </Input>

        <div class="reset-password-requirements text-xs text-gray-700 mt-2 transition-opacity duration-200">
          {{ t('auth.reset_password.requirements.title') }}
          <ul class="reset-password-requirements-list list-disc list-inside mt-1 space-y-1">
            <li
              v-for="(requirement, index) in requirements"
              :key="index"
              class="reset-password-requirement transition-colors duration-200"
              :class="{
                'text-green-600': requirement.valid,
                'text-gray-600': !requirement.valid
              }"
            >
              {{ requirement.text }}
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? t('auth.reset_password.submitting') : t('auth.reset_password.submit')"
          severity="primary"
          fluid
          class="transition-all duration-200"
        />

        <div class="reset-password-footer text-center mt-4">
          <router-link
            to="/login"
            class="reset-password-link text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
          >
            {{ t('auth.reset_password.back_to_login') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
//import { API_RESPONSE_CODES } from '@/constants/apiResponseCodes'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  password: '',
  confirmPassword: '',
})

const resetToken = route.params.token

// Добавляем проверку токена при монтировании компонента
onMounted(async () => {
  if (!resetToken) {
    toast.error(t('auth.reset_password.errors.invalid_token'))
    router.push('/recovery')
    return
  }

  await validateToken()
})

// Password validation
const passwordValidator = (value) => {
  if (!value) return true
  const hasMinLength = value.length >= 8
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumbers = /\d/.test(value)

  if (!hasMinLength) return t('auth.validation.password_length')
  if (!hasUpperCase) return t('auth.validation.password_uppercase')
  if (!hasLowerCase) return t('auth.validation.password_lowercase')
  if (!hasNumbers) return t('auth.validation.password_number')

  return true
}

const confirmPasswordValidator = (value) => {
  if (!value) return t('auth.validation.confirm_password_required')
  if (value !== formData.value.password) return t('auth.validation.password_mismatch')
  return true
}

const requirements = computed(() => {
  const password = formData.value.password
  return [
    {
      text: t('auth.reset_password.requirements.length'),
      valid: password.length >= 8
    },
    {
      text: t('auth.reset_password.requirements.uppercase'),
      valid: /[A-Z]/.test(password)
    },
    {
      text: t('auth.reset_password.requirements.lowercase'),
      valid: /[a-z]/.test(password)
    },
    {
      text: t('auth.reset_password.requirements.number'),
      valid: /\d/.test(password)
    }
  ]
})

const rules = computed(() => ({
  password: {
    required: helpers.withMessage(t('auth.validation.password_required'), required),
    valid: helpers.withMessage(passwordValidator, () => true),
  },
  confirmPassword: {
    required: helpers.withMessage(t('auth.validation.confirm_password_required'), required),
    valid: helpers.withMessage(confirmPasswordValidator, () => true),
  },
}))

const v$ = useVuelidate(rules, formData)
const loading = ref(false)
//const error = ref('')
//const tokenError = ref(false)

const clearForm = () => {
  formData.value = {
    password: '',
    confirmPassword: '',
  }
  v$.value.$reset()
}

// Добавляем навигационный guard
const beforeRouteLeave = (to, from, next) => {
  next()
}

// Регистрируем guard
onBeforeRouteLeave(beforeRouteLeave)

const getErrorMessage = (errorCode) => {
  const errorKeys = {
    'INVALID_TOKEN': 'auth.reset_password.errors.invalid_token',
    'TOKEN_EXPIRED': 'auth.reset_password.errors.token_expired',
    'TOKEN_NOT_FOUND': 'auth.reset_password.errors.token_not_found',
    'PASSWORD_TOO_WEAK': 'auth.reset_password.errors.password_too_weak',
    'default': 'auth.reset_password.errors.default'
  }

  return t(errorKeys[errorCode] || errorKeys.default)
}

const validateToken = async () => {
  try {
    const response = await authStore.validateResetToken(resetToken)
    if (!response.success) {
      const errorMessage = getErrorMessage(response.error_code || 'INVALID_TOKEN')
      toast.error(errorMessage)
      router.push('/recovery')
    }
  } catch (error) {
    const errorMessage = getErrorMessage('INVALID_TOKEN')
    toast.error(errorMessage)
    router.push('/recovery')
  }
}

const handleSubmit = async () => {
  const result = await v$.value.$validate()
  if (!result) {
    toast.error(t('auth.reset_password.errors.form_validation'), {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored"
    })
    return
  }

  loading.value = true

  try {
    const success = await authStore.resetPassword(resetToken, formData.value.password)

    if (success) {
      clearForm()
      toast.success(t('auth.reset_password.success'), {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      })
      router.push('/login')
    } else {
      toast.error(authStore.resetPasswordError || t('auth.reset_password.error'), {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      })
    }
  } catch (error) {
    console.error('Reset password error:', error)
    toast.error(t('auth.reset_password.error'), {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored"
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  background-color: #f9fafb !important;
}

.reset-password-card {
  background-color: white !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(0) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}

.reset-password-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.reset-password-title {
  color: #111827 !important;
  font-size: 1.5rem !important;
  font-weight: 700 !important;
}

.reset-password-subtitle {
  color: #4b5563 !important;
  font-size: 0.875rem !important;
}

.reset-password-form {
  color: #374151 !important;
}

:deep(.reset-password-input) {
  position: relative !important;
  width: 100% !important;
}

:deep(.reset-password-input .p-inputtext) {
  width: 100% !important;
  padding: 0.5rem 0.75rem !important;
  border: 1px solid #d1d5db !important;
  border-radius: 0.375rem !important;
  background-color: white !important;
  color: #374151 !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  transition: all 0.2s ease !important;
}

:deep(.reset-password-input .p-inputtext:focus) {
  border-color: #4f46e5 !important;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
  outline: none !important;
}

:deep(.reset-password-input .p-inputtext.p-invalid) {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
}

:deep(.reset-password-input label) {
  color: #374151 !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
  margin-bottom: 0.25rem !important;
}

:deep(.reset-password-input input) {
  padding-right: 2.5rem !important;
}

:deep(.reset-password-input .icon) {
  pointer-events: none !important;
}

.reset-password-requirements {
  color: #374151 !important;
  opacity: 1 !important;
  transition: opacity 0.2s ease !important;
}

.reset-password-requirements.hidden {
  opacity: 0 !important;
}

.reset-password-requirements-list {
  color: #374151 !important;
}

.reset-password-requirement {
  transition: color 0.2s ease !important;
}

.reset-password-link {
  color: #4f46e5 !important;
  font-weight: 500 !important;
  transition: color 0.2s ease !important;
}

.reset-password-link:hover {
  color: #4338ca !important;
}

:deep(.p-button) {
  background-color: #4f46e5 !important;
  border: none !important;
  font-weight: 500 !important;
  color: white !important;
  transition: all 0.2s ease !important;
}

:deep(.p-button:enabled:hover) {
  background-color: #4338ca !important;
  color: white !important;
  transform: translateY(-1px) !important;
}

:deep(.p-button:enabled:active) {
  background-color: #3730a3 !important;
  color: white !important;
  transform: translateY(0) !important;
}

:deep(.p-button.p-button-loading) {
  background-color: #6366f1 !important;
  color: white !important;
}

:deep(.error-message) {
  color: #dc2626 !important;
  font-size: 0.875rem !important;
  margin-top: 0.25rem !important;
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both !important;
}

:deep(.success-message) {
  color: #059669 !important;
  font-size: 0.875rem !important;
  margin-top: 0.25rem !important;
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
