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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { withI18nMessage } from '@/utils/validation'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import TwoFactorAuth from '@/components/auth/TwoFactorAuth.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const show2FA = ref(false)

const formData = reactive({
  email: '',
  password: ''
})

const rules = {
  email: { required, email },
  password: { required }
}

const v$ = useVuelidate(rules, formData)

const validateField = async (field) => {
  await v$.value[field].$touch()
}

const handleSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    toast.error(t('validation.form_errors'))
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login({
      email: formData.email,
      password: formData.password
    })

    if (result.success) {
      toast.success('Вход выполнен успешно')
      const redirectPath = router.currentRoute.value.query.redirect || '/'
      await router.push(redirectPath)
      return
    }

    // Обработка различных кодов ошибок
    switch (result.error_code) {
      case 'MISSING_CREDENTIALS':
        toast.error('Пожалуйста, введите email и пароль')
        break

      case 'INVALID_CREDENTIALS':
        toast.error('Неверный email или пароль')
        break

      case 'LOGIN_FAILED':
        toast.error('Не удалось выполнить вход')
        break

      case 'ACCOUNT_INACTIVE':
        toast.warning('Ваш аккаунт неактивен. Пожалуйста, обратитесь в службу поддержки')
        break

      case 'EMAIL_NOT_VERIFIED':
        toast.warning(
          'Для входа необходимо подтвердить email. Проверьте вашу почту или запросите повторное письмо с подтверждением',
          {
            autoClose: 8000,
            icon: '✉️'
          }
        )
        break

      case 'ACCOUNT_BLOCKED':
        toast.error('Ваш аккаунт заблокирован. Пожалуйста, обратитесь в службу поддержки', {
          autoClose: 8000
        })
        break

      case 'SYSTEM_ERROR':
        toast.error('Произошла системная ошибка. Попробуйте позже')
        break

      default:
        toast.error('Произошла неизвестная ошибка')
    }

    error.value = result.message

  } catch (err) {
    console.error('Login error:', err)
    toast.error(t('notifications.unexpected_error'))
    error.value = t('notifications.unexpected_error')
  } finally {
    loading.value = false
  }
}

const handleLoginSuccess = () => {
  const redirectPath = router.currentRoute.value.query.redirect || '/'
  router.push(redirectPath)
}
</script>
