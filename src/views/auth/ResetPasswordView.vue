<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
          {{ t('auth.reset_password.title') }}
        </h1>
        <p class="text-center text-gray-600 text-sm">
          {{ t('auth.reset_password.subtitle') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.password"
          type="password"
          :label="t('auth.reset_password.new_password')"
          :error="v$.password.$errors[0]?.$message"
          @blur="v$.password.$touch()"
        />

        <Input
          v-model="formData.confirmPassword"
          type="password"
          :label="t('auth.reset_password.confirm_password')"
          :error="v$.confirmPassword.$errors[0]?.$message"
          @blur="v$.confirmPassword.$touch()"
        />

        <div class="text-xs text-gray-600 mt-2">
          {{ t('auth.reset_password.requirements.title') }}
          <ul class="list-disc list-inside mt-1">
            <li>{{ t('auth.reset_password.requirements.length') }}</li>
            <li>{{ t('auth.reset_password.requirements.uppercase') }}</li>
            <li>{{ t('auth.reset_password.requirements.lowercase') }}</li>
            <li>{{ t('auth.reset_password.requirements.number') }}</li>
          </ul>
        </div>

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? t('auth.reset_password.submitting') : t('auth.reset_password.submit')"
          severity="primary"
          fluid
        />

        <div class="text-center mt-4">
          <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500">
            {{ t('auth.reset_password.back_to_login') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { API_RESPONSE_CODES } from '@/constants/apiResponseCodes'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  password: '',
  confirmPassword: '',
})

const resetToken = route.params.token

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
const error = ref('')
const tokenError = ref(false)

const clearForm = () => {
  formData.value = {
    password: '',
    confirmPassword: '',
  }
  v$.value.$reset()
}

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
      const errorMessage = getErrorMessage('INVALID_TOKEN')
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
    toast.error(t('auth.reset_password.errors.form_validation'))
    return
  }

  loading.value = true

  try {
    const response = await authStore.resetPassword({
      token: resetToken,
      password: formData.value.password
    })

    // Проверяем точно в том виде, в котором приходит с сервера
    if (response.status === 200 && response.error_code === 'PASSWORD_RESET_SUCCESS') {
      toast.success(t('auth.reset_password.success.password_changed'))
      router.push('/login')
      return
    }

    // В противном случае считаем что это ошибка
    toast.error(t('auth.reset_password.errors.token_expired'))
    router.push('/recovery')

  } catch (error) {
    toast.error(t('auth.reset_password.errors.token_expired'))
    router.push('/recovery')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.p-button) {
  background-color: #4f46e5;
  border: none;
  font-weight: 500;
}

:deep(.p-button:enabled:hover) {
  background-color: #4338ca;
}

:deep(.p-button:enabled:active) {
  background-color: #3730a3;
}

:deep(.p-button.p-button-loading) {
  background-color: #6366f1;
}
</style>
