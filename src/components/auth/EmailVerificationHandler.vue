<template>
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800">
          {{ $t('UI.loginview.email_not_verified.title') }}
        </h3>
        <div class="mt-2 text-sm text-yellow-700">
          <p>{{ $t('UI.loginview.email_not_verified.description') }}</p>
        </div>

        <div class="mt-4 space-y-3">
          <!-- Опция 1: Отправить новое письмо -->
          <button
            @click.stop="handleResendEmail"
            type="button"
            :disabled="resendLoading"
            class="w-full text-left px-3 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <span v-if="resendLoading">{{ $t('UI.loginview.email_not_verified.sending') }}</span>
            <span v-else>{{ $t('UI.loginview.email_not_verified.resend') }}</span>
          </button>

          <!-- Опция 2: Удалить аккаунт -->
          <button
            @click.stop="handleDeleteAccount"
            type="button"
            :disabled="deleteLoading"
            class="w-full text-left px-3 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <span v-if="deleteLoading">{{ $t('UI.loginview.email_not_verified.deleting') }}</span>
            <span v-else>{{ $t('UI.loginview.email_not_verified.delete_account') }}</span>
          </button>

          <!-- Опция 3: Изменить email -->
          <button
            @click.stop="showEmailUpdateModal"
            type="button"
            class="w-full text-left px-3 py-2 text-sm font-medium text-blue-800 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ $t('UI.loginview.email_not_verified.change_email') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для изменения email -->
    <div
      v-if="showEmailUpdate"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    >
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ $t('UI.loginview.update_email.title') }}
          </h3>

          <form @submit.prevent="handleUpdateEmail" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{
                $t('UI.loginview.update_email.label')
              }}</label>
              <input
                v-model="newEmail"
                type="email"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                :class="{ 'border-red-500': v$.newEmail.$error }"
                :placeholder="$t('UI.loginview.update_email.placeholder')"
                @blur="v$.newEmail.$touch"
              />
              <p v-if="v$.newEmail.$error" class="mt-1 text-sm text-red-600">
                {{ v$.newEmail.$errors[0].$message }}
              </p>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showEmailUpdate = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                {{ $t('UI.loginview.update_email.button.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="updateLoading || v$.newEmail.$invalid"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="updateLoading">{{
                  $t('UI.loginview.update_email.button.updating')
                }}</span>

                <span v-else>{{ $t('UI.loginview.update_email.button.update') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { withI18nMessage } from '@/utils/validation'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/AuthStore'
import { toast } from 'vue3-toastify'

const { t } = useI18n()

const props = defineProps({
  email: {
    type: String,
    required: true,
  },
})

const authStore = useAuthStore()
const resendLoading = ref(false)
const deleteLoading = ref(false)
const updateLoading = ref(false)
const showEmailUpdate = ref(false)
const newEmail = ref('')

// Валидация с Vuelidate
const rules = computed(() => ({
  newEmail: {
    required: withI18nMessage(required, 'VALIDATION.required'),
    email: withI18nMessage(email, 'VALIDATION.email'),
  },
}))

const v$ = useVuelidate(rules, { newEmail })

// Добавьте watcher для обновления валидации при смене языка
watch(
  () => t,
  () => {
    // Полностью пересоздаем валидацию
    v$.value.$reset()
    // Очищаем все ошибки
    v$.value.$clearExternalResults()
    // Принудительно пересчитываем
    nextTick(() => {
      v$.value.$validate()
    })
  },
  { deep: true },
)

watch(
  () => t('VALIDATION.email'),
  () => {
    v$.value.$reset()
  },
)

const validateEmail = async () => {
  const result = await v$.value.$validate()
  return result
}

const handleResendEmail = async () => {
  resendLoading.value = true
  try {
    const result = await authStore.resendVerificationEmail(props.email)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  } catch (error) {
    toast.error('Ошибка при отправке письма')
  } finally {
    resendLoading.value = false
  }
}

const handleDeleteAccount = async () => {
  if (!confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
    return
  }

  deleteLoading.value = true
  try {
    const result = await authStore.deleteUnverifiedAccount(props.email)
    if (result.success) {
      toast.success(result.message)
      // Перенаправляем на страницу регистрации
      window.location.href = '/signup'
    } else {
      toast.error(result.message)
    }
  } catch (error) {
    toast.error('Ошибка при удалении аккаунта')
  } finally {
    deleteLoading.value = false
  }
}

const handleUpdateEmail = async () => {
  const isValid = await validateEmail()
  if (!isValid) {
    return
  }

  updateLoading.value = true
  try {
    const result = await authStore.updateEmailForUnverified(props.email, newEmail.value)
    if (result.success) {
      toast.success(result.message)
      showEmailUpdate.value = false
      newEmail.value = ''
      v$.value.$reset()
      window.location.href = '/login'
    } else {
      toast.error(result.message)
    }
  } catch (error) {
    toast.error('Ошибка при обновлении email')
  } finally {
    updateLoading.value = false
  }
}

// Сброс валидации при закрытии модального окна
const showEmailUpdateModal = () => {
  showEmailUpdate.value = true
  newEmail.value = ''
  v$.value.$reset()
}

// Добавьте watcher для отладки
watch(showEmailUpdate, (newVal) => {
  console.log('showEmailUpdate changed to:', newVal)
})
</script>
