<!-- src/views/LoginPage.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">
          {{ $t('auth.signup_title') }}
        </h1>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.name"
          type="text"
          :label="$t('auth.name')"
          :error="v$.name.$error ? v$.name.$errors[0].$message : ''"
          @blur="validateField('name')"
        />

        <Input
          v-model="formData.email"
          type="email"
          :label="$t('auth.email')"
          :error="v$.email.$error ? v$.email.$errors[0].$message : ''"
          @blur="validateField('email')"
        />

        <Select
          v-model="formData.role"
          :label="$t('auth.role.label')"
          :options="[
            { value: 'user', label: $t('auth.role.user') },
            { value: 'business', label: $t('auth.role.business') },
            { value: 'admin', label: $t('auth.role.admin') },
          ]"
          :placeholder="$t('auth.role.select_placeholder')"
          :error="v$.role.$error ? v$.role.$errors[0].$message : ''"
          @blur="validateField('role')"
        />

        <Input
          v-model="formData.password"
          type="password"
          :label="$t('auth.password')"
          :error="v$.password.$error ? v$.password.$errors[0].$message : ''"
          @blur="validateField('password')"
        />

        <Input
          v-model="formData.confirmPassword"
          type="password"
          :label="$t('auth.confirm_password')"
          :error="v$.confirmPassword.$error ? v$.confirmPassword.$errors[0].$message : ''"
          @blur="validateField('confirmPassword')"
        />

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? $t('auth.signup_loading') : $t('auth.signup_button')"
          style="height: 44px"
          severity="primary"
          fluid="true"
        />

        <!-- Добавляем ссылку на логин -->
        <div class="text-center mt-4">
          <span class="text-sm text-gray-600">{{ $t('auth.have_account') }}</span>
          <router-link to="/login" class="ml-1 text-sm text-primary-600 hover:text-primary-500">
            {{ $t('auth.login') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { withI18nMessage } from '@/utils/validation'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'

import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const emailValidator = (value) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return !value || emailRegex.test(value)
}

const nameValidator = (value) => {
  return !value || (value.length >= 2 && value.length <= 50)
}

const rules = computed(() => ({
  name: {
    required: withI18nMessage(required, 'required'),
    nameLength: withI18nMessage(
      nameValidator,
      'nameLength',
      { min: 2, max: 50 }
    ),
  },
  email: {
    required: withI18nMessage(required, 'required'),
    email: withI18nMessage(emailValidator, 'email'),
  },
  password: {
    required: withI18nMessage(required, 'required'),
    minLength: withI18nMessage(
      helpers.withParams({ min: 8 }, (value) => !value || value.length >= 8),
      'minLength',
      { min: 8 },
    ),
  },
  confirmPassword: {
    required: withI18nMessage(required, 'required'),
    sameAsPassword: withI18nMessage(
      (value) => !value || value === formData.value.password,
      'passwordMatch',
    ),
  },
  role: {
    required: withI18nMessage(required, 'required'),
  },
}))

const v$ = useVuelidate(rules, formData)
const loading = ref(false)

const validateField = async (fieldName) => {
  await v$.value[fieldName].$touch()
}

const handleSubmit = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) {
    toast.error(t('notifications.registration.validation_error'))
    return
  }

  loading.value = true

  try {
    const result = await authStore.register({
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      role: formData.value.role
    })

    if (!result.success) {
      switch(result.error_code) {
        case 'EMAIL_ALREADY_EXISTS':
          toast.error(t('notifications.registration.email_exists'))
          break
        case 'NETWORK_ERROR':
          toast.error(t('notifications.registration.network_error'))
          break
        default:
          toast.error(t('notifications.registration.system_error'))
      }
      return
    }

    // Очищаем форму только при успешной регистрации
    formData.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    }

    toast.success(t('notifications.registration.success'))

    setTimeout(() => {
      router.push({
        path: '/login',
        query: {
          message: 'verification_sent',
          email: formData.value.email
        }
      })
    }, 2000)

  } catch (err) {
    console.error('Unexpected error during registration:', err)
    toast.error(t('notifications.registration.system_error'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-primary-600 {
  background-color: #4f46e5;
}
.hover\:bg-primary-700:hover {
  background-color: #4338ca;
}
.focus\:ring-primary-500:focus {
  --tw-ring-color: #6366f1;
}
.focus\:border-primary-500:focus {
  border-color: #6366f1;
}
</style>
