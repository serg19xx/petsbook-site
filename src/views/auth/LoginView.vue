<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">

      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('UI.loginview.h2.title') }}
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.email"
          type="email"
          :label="'UI.loginview.input.label.email'"
          :error="v$.email.$error ? v$.email.$errors[0].$message : ''"
          @blur="validateField('email')"
        />

        <Input
          v-model="formData.password"
          type="password"
          :label="'UI.loginview.input.label.password'"
          :error="v$.password.$error ? v$.password.$errors[0].$message : ''"
          @blur="validateField('password')"
        />

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember"
              v-model="formData.remember"
              type="checkbox"
              class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-900">
              {{ $t('UI.loginview.checkbox.label.remember') }}
            </label>
          </div>

          <router-link to="/recovery" class="text-sm text-primary-600 hover:text-primary-500">
            {{ $t('UI.loginview.rlink.forgot') }}
          </router-link>
        </div>

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? 'UI.loginview.button.submitting' : 'UI.loginview.button.submit'"
          severity="primary"
          class="w-full"
          style="height: 44px"
        />
<!--
        <div
          v-if="error"
          class="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200"
        >
          {{ error }}
        </div>
-->
        <div class="text-center mt-4">
          <span class="text-sm text-gray-600">{{ $t('UI.loginview.span.no_account') }}</span>
          <router-link to="/signup" class="ml-1 text-sm text-primary-600 hover:text-primary-500">
            {{ $t('UI.loginview.rlink.register') }}
          </router-link>
        </div>

        <!-- Показываем компонент для неверифицированных email -->
        <EmailVerificationHandler
          v-if="showEmailVerificationHandler"
          :email="formData.email"
        />
      </form>
    </div>
  </div>
</template>

<!-- eslint-disable no-undef -->
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useUserStore } from '@/stores/UserStore'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { withI18nMessage } from '@/utils/validation'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import EmailVerificationHandler from '@/components/auth/EmailVerificationHandler.vue'

const { t, locale, messages } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const loading = ref(false)
const error = ref('')
const formData = reactive({
  email: '',
  password: '',
  remember: false
})

const rules = {
  email: {
    required: withI18nMessage(required, t('VALIDATION.required')),
    email: withI18nMessage(email, t('VALIDATION.email'))
  },
  password: {
    required: withI18nMessage(required, t('VALIDATION.required'))
  }
}

const v$ = useVuelidate(rules, formData)

const validateField = async (field) => {
  await v$.value[field].$touch()
}

const showEmailVerificationHandler = ref(false)

const handleSubmit = async () => {
  error.value = ''
  const isValid = await v$.value.$validate()

  if (!isValid) {
    error.value = t('MESSAGE.loginview.errors.invalid_credentials')
    toast.error(t('MESSAGE.loginview.errors.invalid_credentials'))
    return
  }

  loading.value = true
  showEmailVerificationHandler.value = false

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = await authStore.login({
      email: formData.email,
      password: formData.password,
      remember: formData.remember
    })

    console.log('Login response:', response) // Отладка

    if (response.status === 200 && response.error_code === 'LOGIN_SUCCESS') {
      await userStore.fetchUserData()
      const redirectPath = router.currentRoute.value.query.redirect || '/'
      router.push(redirectPath)
    } else if (response.error_code === 'EMAIL_NOT_VERIFIED') {
      console.log('Email not verified, showing handler') // Отладка
      showEmailVerificationHandler.value = true
      error.value = response.message
    } else {
      if (response.isSystemError) {
        toast.error(response.message, {
          autoClose: false,
          closeOnClick: false,
          style: {
            backgroundColor: '#dc2626',
            color: 'white',
            fontSize: '14px',
            whiteSpace: 'pre-line'
          }
        })
        console.error('System Error Details:', response.data)
      } else {
        error.value = response.message
        toast.error(response.message)
      }
    }
  } catch (err) {
    console.error('Error logging in:', err)
    error.value = err.message || t('MESSAGE.loginview.errors.invalid_credentials')
    toast.error(err.message || t('MESSAGE.loginview.errors.invalid_credentials'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  //console.log('Current locale:', locale.value)
  //console.log('Messages:', messages.value)
  //console.log('Login title:', t('loginview.h2.title'))
})

</script>

