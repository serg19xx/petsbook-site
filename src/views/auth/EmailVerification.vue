<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <div v-if="loading" class="text-center">
        <div class="mb-4 text-xl font-semibold text-gray-700">Проверка email...</div>
        <div
          class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
        ></div>
      </div>

      <div v-else-if="success" class="text-center">
        <div class="mb-4 text-xl font-semibold text-green-600">Email успешно подтвержден!</div>
        <p class="mb-4 text-gray-600">Теперь вы можете войти в свой аккаунт.</p>
        <router-link
          to="/login"
          class="inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Войти
        </router-link>
      </div>

      <div v-else class="text-center">
        <div class="mb-4 text-xl font-semibold text-red-600">
          {{ getErrorMessage(errorCode) }}
        </div>
        <p class="mb-4 text-gray-600">
          {{ getErrorDescription(errorCode) }}
        </p>
        <div class="space-y-4">
          <router-link
            to="/login"
            class="inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Вернуться на страницу входа
          </router-link>
          <div v-if="errorCode === 'INVALID_OR_EXPIRED_TOKEN'" class="mt-4">
            <button
              @click="handleResendVerification"
              :disabled="resendLoading"
              class="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Отправить новое письмо с подтверждением
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api' // Updated import
import { toast } from 'vue3-toastify'
import { AUTH_ERROR_CODES } from '@/constants/authCodes'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const success = ref(false)
const errorCode = ref('')
const resendLoading = ref(false)

const getErrorMessage = (code) => {
  switch (code) {
    case 'INVALID_OR_EXPIRED_TOKEN':
      return 'Недействительная или устаревшая ссылка'
    case 'INVALID_TOKEN':
      return 'Недействительная ссылка подтверждения'
    case 'EMAIL_ALREADY_VERIFIED':
      return 'Email уже подтвержден'
    default:
      return 'Ошибка при подтверждении email'
  }
}

const getErrorDescription = (code) => {
  switch (code) {
    case 'INVALID_OR_EXPIRED_TOKEN':
      return 'Срок действия ссылки для подтверждения истек. Пожалуйста, запросите новую ссылку.'
    case 'INVALID_TOKEN':
      return 'Ссылка подтверждения недействительна. Пожалуйста, проверьте правильность ссылки.'
    case 'EMAIL_ALREADY_VERIFIED':
      return 'Ваш email уже подтвержден. Вы можете войти в систему.'
    default:
      return 'Произошла ошибка при подтверждении email. Пожалуйста, попробуйте позже.'
  }
}

const handleResendVerification = async () => {
  resendLoading.value = true
  try {
    const response = await api.post('/auth/resend-verification')
    if (response.data.success) {
      toast.success('Новое письмо с подтверждением отправлено на ваш email', {
        autoClose: 5000,
      })
    } else {
      toast.error('Не удалось отправить письмо. Попробуйте позже.', {
        autoClose: 5000,
      })
    }
  } catch (error) {
    toast.error('Ошибка при отправке письма подтверждения', {
      autoClose: 5000,
    })
    console.error('Resend verification error:', error)
  } finally {
    resendLoading.value = false
  }
}

onMounted(async () => {
  try {
    const token = route.params.token
    const response = await api.get(`/auth/verify-email/${token}`)

    if (response.data.success) {
      success.value = true
      toast.success('Email успешно подтвержден!', {
        autoClose: 3000,
      })
    } else {
      success.value = false
      errorCode.value = response.data.message
      toast.error(getErrorMessage(response.data.message), {
        autoClose: 5000,
      })
    }
  } catch (error) {
    success.value = false
    errorCode.value = error.response?.data?.message || 'UNKNOWN_ERROR'
    toast.error(getErrorMessage(errorCode.value), {
      autoClose: 5000,
    })
    console.error('Email verification error:', error)
  } finally {
    loading.value = false
  }
})
</script>
