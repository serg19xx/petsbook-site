<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div v-if="show2FA">
      <TwoFactorAuth
        :email="formData.email"
        @cancel="show2FA = false"
        @success="handleLoginSuccess"
      />
    </div>
    <div v-else class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">
          {{ $t('auth.login_title') }}
        </h1>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.email"
          type="email"
          :label="$t('auth.email')"
          :error="v$.email.$error ? v$.email.$errors[0].$message : ''"
          @blur="validateField('email')"
        />

        <Input
          v-model="formData.password"
          type="password"
          :label="$t('auth.password')"
          :error="v$.password.$error ? v$.password.$errors[0].$message : ''"
          @blur="validateField('password')"
        />

        <div class="flex items-center justify-end">
          <router-link to="/recovery" class="text-sm text-primary-600 hover:text-primary-500">
            {{ $t('auth.forgot_password') }}
          </router-link>
        </div>

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? $t('auth.login_loading') : $t('auth.login_button')"
          severity="primary"
          class="w-full"
          style="height: 44px"
        />

        <div
          v-if="error"
          class="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200"
        >
          {{ error }}
        </div>

        <div class="text-center mt-4">
          <span class="text-sm text-gray-600">{{ $t('auth.no_account') }}</span>
          <router-link to="/signup" class="ml-1 text-sm text-primary-600 hover:text-primary-500">
            {{ $t('auth.signup_link') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { withI18nMessage } from '@/utils/validation'
import TwoFactorAuth from '@/components/auth/TwoFactorAuth.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const show2FA = ref(false)

const formData = ref({
  email: '',
  password: '',
})

const rules = {
  email: {
    required: withI18nMessage(required),
    email: withI18nMessage(email),
  },
  password: {
    required: withI18nMessage(required),
  },
}

const v$ = useVuelidate(rules, formData)

const validateField = async (field) => {
  await v$.value[field].$touch()
}

const handleSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(formData.value)

    if (result.requires2FA) {
      show2FA.value = true
    } else if (result.success) {
      handleLoginSuccess()
    } else {
      error.value = result.message || 'Ошибка входа'
    }
  } catch (err) {
    error.value = 'Произошла ошибка при входе'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

const handleLoginSuccess = () => {
  const redirectPath = router.currentRoute.value.query.redirect || '/'
  router.push(redirectPath)
}
</script>

<style scoped>
:deep(.p-password input) {
  width: 100%;
}

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
