<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
          {{ $t('auth.recovery_title') }}
        </h1>
        <p class="text-center text-gray-600 text-sm">
          {{ $t('auth.recovery_description') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.email"
          type="email"
          :label="$t('auth.email')"
          :placeholder="$t('auth.email_placeholder')"
          :error="v$.email.$error ? v$.email.$errors[0].$message : ''"
          @blur="validateField('email')"
        />

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? $t('auth.recovery_loading') : $t('auth.recovery_button')"
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
            {{ $t('auth.back_to_login') }}
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
import { required, email } from '@vuelidate/validators'
import { withI18nMessage } from '@/utils/validation'

import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const authStore = useAuthStore()

const formData = ref({
  email: '',
})

const rules = computed(() => ({
  email: {
    required: withI18nMessage(required, 'required'),
    email: withI18nMessage(email, 'email'),
  },
}))

const v$ = useVuelidate(rules, formData)
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const validateField = async (fieldName) => {
  await v$.value[fieldName].$touch()
}

const handleSubmit = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  loading.value = true
  message.value = ''
  isError.value = false

  try {
    const result = await authStore.requestPasswordReset(formData.value.email)
    if (result.success) {
      message.value = result.message
      formData.value.email = ''
      await v$.value.$reset()
    } else {
      message.value = result.message
      isError.value = true
    }
  } catch (error) {
    message.value = $t('auth.recovery_error')
    isError.value = true
  } finally {
    loading.value = false
  }
}
</script>
