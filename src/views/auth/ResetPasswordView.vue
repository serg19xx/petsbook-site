<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">Создание нового пароля</h1>
        <p class="text-center text-gray-600 text-sm">Пожалуйста, введите новый пароль</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
        <Input
          v-model="formData.password"
          type="password"
          label="Новый пароль"
          :error="v$.password.$errors[0]?.$message"
          @blur="v$.password.$touch()"
        />

        <Input
          v-model="formData.confirmPassword"
          type="password"
          label="Подтвердите пароль"
          :error="v$.confirmPassword.$errors[0]?.$message"
          @blur="v$.confirmPassword.$touch()"
        />

        <div class="text-xs text-gray-600 mt-2">
          Пароль должен содержать:
          <ul class="list-disc list-inside mt-1">
            <li>Минимум 8 символов</li>
            <li>Хотя бы одну заглавную букву</li>
            <li>Хотя бы одну строчную букву</li>
            <li>Хотя бы одну цифру</li>
          </ul>
        </div>

        <Button
          type="submit"
          :loading="loading"
          :label="loading ? 'Сохранение...' : 'Сохранить новый пароль'"
          severity="primary"
          fluid
        />

        <!-- Добавляем ссылку на страницу входа -->
        <div class="text-center mt-4">
          <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500">
            Вернуться на страницу входа
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
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  password: '',
  confirmPassword: '',
})

const resetToken = route.params.token

// Валидация пароля
const passwordValidator = (value) => {
  if (!value) return true
  const hasMinLength = value.length >= 8
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumbers = /\d/.test(value)

  if (!hasMinLength) return 'Пароль должен содержать минимум 8 символов'
  if (!hasUpperCase) return 'Пароль должен содержать хотя бы одну заглавную букву'
  if (!hasLowerCase) return 'Пароль должен содержать хотя бы одну строчную букву'
  if (!hasNumbers) return 'Пароль должен содержать хотя бы одну цифру'

  return true
}

const confirmPasswordValidator = (value) => {
  if (!value) return 'Подтвердите пароль'
  if (value !== formData.value.password) return 'Пароли не совпадают'
  return true
}

const rules = computed(() => ({
  password: {
    required: helpers.withMessage('Введите пароль', required),
    valid: helpers.withMessage(passwordValidator, () => true),
  },
  confirmPassword: {
    required: helpers.withMessage('Подтвердите пароль', required),
    valid: helpers.withMessage(confirmPasswordValidator, () => true),
  },
}))

const v$ = useVuelidate(rules, formData)
const loading = ref(false)

const clearForm = () => {
  formData.value = {
    password: '',
    confirmPassword: '',
  }
  // Сбрасываем состояние валидации
  v$.value.$reset()
}

const handleSubmit = async () => {
  const result = await v$.value.$validate()
  if (!result) {
    toast.error('Пожалуйста, исправьте ошибки в форме')
    return
  }

  loading.value = true

  try {
    const response = await authStore.resetPassword({
      token: resetToken,
      password: formData.value.password,
    })

    if (response.success) {
      clearForm() // Очищаем форму после успешного сброса
      toast.success('Пароль успешно изменен')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      toast.error(response.message)
    }
  } catch (error) {
    toast.error('Произошла ошибка при смене пароля')
    console.error('Reset password error:', error)
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
