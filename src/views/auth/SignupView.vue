<!-- src/views/LoginPage.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
          {{ $t('UI.signupview.h1.title') }}
        </h1>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.name"
          type="text"
          :label="'UI.signupview.input.label.name'"
          :error="v$.name.$error ? v$.name.$errors[0].$message : ''"
          @blur="validateField('name')"
        />

        <Input
          v-model="formData.email"
          type="email"
          :label="'UI.signupview.input.label.email'"
          :error="v$.email.$error ? v$.email.$errors[0].$message : ''"
          @blur="validateField('email')"
        />

        <Select
          v-model="formData.role"
          :label="'UI.signupview.select.label.role'"
          :options="[
            { value: 'user', label: $t('UI.signupview.select.option.user') },
            { value: 'business', label: $t('UI.signupview.select.option.business') },
            { value: 'admin', label: $t('UI.signupview.select.option.admin') }
          ]"
          :placeholder="$t('UI.signupview.select.placeholder.role')"
          :error="v$.role.$error ? v$.role.$errors[0].$message : ''"
          @blur="validateField('role')"
        />

        <Input
          v-model="formData.password"
          type="password"
          :label="'UI.signupview.input.label.password'"
          :error="v$.password.$error ? v$.password.$errors[0].$message : ''"
          @blur="validateField('password')"
        />

        <Input
          v-model="formData.confirmPassword"
          type="password"
          :label="'UI.signupview.input.label.confirm_password'"
          :error="v$.confirmPassword.$error ? v$.confirmPassword.$errors[0].$message : ''"
          @blur="validateField('confirmPassword')"
        />

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? 'UI.signupview.button.submitting' : 'UI.signupview.button.submit'"
          severity="primary"
          fluid
        />

        <div class="text-center mt-4">
          <span class="text-sm text-gray-600">{{ $t('UI.signupview.span.have_account') }}</span>
          <router-link to="/login" class="ml-1 text-sm text-primary-600 hover:text-primary-500">
            {{ $t('UI.signupview.rlink.login') }}
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
import { required, email } from '@vuelidate/validators'
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
  role: '',
  password: '',
  confirmPassword: ''
})

const rules = computed(() => ({
  name: {
    required: withI18nMessage(required, 'VALIDATION.required'),
    minLength: withI18nMessage(
      (value) => !value || value.length >= 2,
      'VALIDATION.minLength',
      { min: 2 }
    )
  },
  email: {
    required: withI18nMessage(required, 'VALIDATION.required'),
    email: withI18nMessage(email, 'VALIDATION.email')
  },
  role: {
    required: withI18nMessage(required, 'VALIDATION.required')
  },
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

const validateField = async (fieldName) => {
  await v$.value[fieldName].$touch()
}

const handleSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    toast.error(t('MESSAGE.signupview.error.validation'))
    return
  }

  loading.value = true

  try {
    const response = await authStore.register({
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      password: formData.value.password
    })

    if (response.success) {
      toast.success(t('MESSAGE.signupview.success.registered'))
      router.push('/login')
    } else {
      toast.error(response.message || t('MESSAGE.signupview.error.unexpected'))
    }
  } catch (error) {
    toast.error(t('MESSAGE.signupview.error.unexpected'))
    console.error('Registration error:', error)
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
