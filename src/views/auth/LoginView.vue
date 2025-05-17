<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">
          {{ $t('auth.login_title') }}
        </h1>
        <p class="text-center text-gray-600 text-sm">
          {{ t('auth.login_subtitle') }}
        </p>
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
            {{ t('auth.forgot_password_link') }}
          </router-link>
        </div>

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? t('auth.login_loading') : t('auth.login_button')"
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
          <span class="text-sm text-gray-600">{{ t('auth.no_account') }}</span>
          <router-link to="/signup" class="ml-1 text-sm text-primary-600 hover:text-primary-500">
            {{ t('auth.signup_link') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<!-- eslint-disable no-undef -->
<script setup>
import { ref, reactive } from 'vue'
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

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const loading = ref(false)
const error = ref('')
const formData = reactive({
  email: '',
  password: ''
})

const userData = userStore.userData

const rules = {
  email: {
    required: withI18nMessage(required, 'required'),
    email: withI18nMessage(email, 'email')
  },
  password: {
    required: withI18nMessage(required, 'required')
  }
}

const v$ = useVuelidate(rules, formData)

const validateField = async (field) => {
  await v$.value[field].$touch()
}

const handleSubmit = async () => {
  error.value = ''
  const isValid = await v$.value.$validate()

  if (!isValid) {
    const errorMessage = t('validation.general_error')
    error.value = errorMessage
    toast.error(errorMessage)
    return
  }

  loading.value = true

  try{
    const response = await authStore.login({
      email: formData.email,
      password: formData.password
    })
//console.log('LoginView handleSubmit',response)
    if (!response.success) {
      error.value = response.message
      toast.error(response.message)
      return
    }

    //getUserData()
    //userStore.userData = response.user
    await userStore.fetchUserData()
    console.log('FETCH  >>>>>  userData:', userStore.userData)

    const avatar = userStore.userData?.avatar || userStore.userData?.value?.avatar || null
    authStore.loginInfo.avatar = avatar

    //console.log('=========================',avatar);
    //authStore.loginInfo.avatar = userStore.userData.avatar

    //toast.success(t('notifications.login_success'))
    const redirectPath = router.currentRoute.value.query.redirect || '/'
    router.push(redirectPath)

  } catch (err) {
    console.error('Error logging in:', err)
    const errorMessage = t('errors.unexpected_error')
    error.value = errorMessage
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

</script>
