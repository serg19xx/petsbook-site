<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
          {{ $t('UI.resetpasswordview.h1.title') }}
        </h1>
        <p class="text-center text-gray-600 text-sm">
          {{ $t('UI.resetpasswordview.p.subtitle') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.password"
          type="password"
          :label="'UI.resetpasswordview.input.label.new_password'"
          :error="v$.password.$error ? v$.password.$errors[0].$message : ''"
          @blur="validateField('password')"
        />

        <Input
          v-model="formData.confirmPassword"
          type="password"
          :label="'UI.resetpasswordview.input.label.confirm_password'"
          :error="v$.confirmPassword.$error ? v$.confirmPassword.$errors[0].$message : ''"
          @blur="validateField('confirmPassword')"
        />

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? $t('UI.resetpasswordview.button.submitting') : $t('UI.resetpasswordview.button.submit')"
          severity="primary"
          fluid
        />

        <div
          v-if="message"
          :class="[
            'mt-4 p-4 rounded-lg text-sm',
            isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200',
          ]"
        >
          {{ message }}
        </div>

        <div class="text-center mt-4">
          <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500">
            {{ $t('UI.resetpasswordview.rlink.back_to_login') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { withI18nMessage } from '@/utils/validation'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useRoute, useRouter } from 'vue-router'

import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  password: '',
  confirmPassword: ''
})

const rules = computed(() => ({
  password: {
    required: withI18nMessage(required, 'VALIDATION.required'),
    minLength: withI18nMessage(
      (value) => !value || value.length >= 8,
      'VALIDATION.minLength',
      { min: 8 }
    )
  },
  confirmPassword: {
    required: withI18nMessage(required, 'VALIDATION.required'),
    sameAsPassword: withI18nMessage(
      (value) => !value || value === formData.value.password,
      'VALIDATION.sameAs'
    )
  }
}))

const v$ = useVuelidate(rules, formData)
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const validateField = async (fieldName) => {
  await v$.value[fieldName].$touch()
}

const handleSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    message.value = t('MESSAGE.resetpasswordview.error.validation')
    isError.value = true
    return
  }

  loading.value = true
  message.value = ''
  isError.value = false

  try {
    // Проверяем наличие токена и выводим его в консоль для отладки
    let token = route.query.token
    // Если token массив (например, ?token=abc&token=def), берем первый
    if (Array.isArray(token)) token = token[0]
    // Приводим к строке, если возможно
    if (typeof token !== 'string') token = String(token ?? '')
    token = token.trim()
    // Если токен пустой, пробуем взять из route.params (например, если маршрут типа /reset-password/:token)
    if (!token || token === 'undefined' || token === 'null' || token.length < 10) {
      if (route.params && route.params.token) {
        token = String(route.params.token).trim()
        console.log('Trying route.params.token:', token, '| length:', token.length)
      }
    }
    console.log('Reset password token (final):', token, '| length:', token.length)
    if (!token || token === 'undefined' || token === 'null' || token.length < 10) {
      message.value = t('MESSAGE.resetpasswordview.error.unexpected')
      isError.value = true
      toast.error(message.value)
      loading.value = false
      return
    }
    // Проверяем пароль для отладки
    console.log('Reset password value:', formData.value.password)
    // Проверяем, что функция существует
    if (typeof authStore.resetPassword !== 'function') {
      console.error('authStore.resetPassword is not a function')
      message.value = t('MESSAGE.resetpasswordview.error.unexpected')
      isError.value = true
      toast.error(message.value)
      loading.value = false
      return
    }
    // ВАЖНО: resetPassword(token, password), а не resetPassword({token, password})
    console.log('Sending reset password request with token:', token, 'and password:', formData.value.password)
    const result = await authStore.resetPassword(token, formData.value.password)

    // resetPassword возвращает true/false, а не объект
    if (result === true) {
      message.value = t('MESSAGE.resetpasswordview.success.password_changed')
      isError.value = false
      toast.success(message.value)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      // Если result === false, используем ошибку из authStore
      message.value = authStore.resetPasswordError || t('MESSAGE.resetpasswordview.error.unexpected')
      isError.value = true
      toast.error(message.value)
    }
  } catch (error) {
    message.value = t('MESSAGE.resetpasswordview.error.unexpected')
    isError.value = true
    toast.error(message.value)
    console.error('Password reset error:', error)
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
