<template>
  <div class="p-6 mx-3 md:mx-0 bg-white shadow-lg rounded-lg w-full max-w-md">
    <h2 class="text-2xl font-semibold mb-4 text-center">Двухфакторная аутентификация</h2>
    <p class="mb-4 text-center text-gray-600">
      Введите код подтверждения из вашего приложения аутентификации
    </p>

    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <Input
          v-model="code"
          type="text"
          placeholder="Введите 6-значный код"
          :error="error"
          maxlength="6"
          pattern="[0-9]*"
          inputmode="numeric"
          :disabled="loading"
          ref="codeInput"
          class="text-center text-2xl tracking-widest"
        />
      </div>

      <div class="space-y-4">
        <Button
          type="submit"
          :loading="loading"
          :label="loading ? 'Проверка...' : 'Подтвердить'"
          severity="primary"
          fluid
        />

        <Button
          type="button"
          @click="handleCancel"
          label="Отмена"
          severity="secondary"
          text
          fluid
        />
      </div>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Не получается войти?
          <a href="#" class="text-primary-600 hover:text-primary-500" @click.prevent="handleHelp">
            Получить помощь
          </a>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps({
  email: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['cancel', 'success'])

const router = useRouter()
const authStore = useAuthStore()
const codeInput = ref(null)
const code = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (code.value.length !== 6) {
    error.value = 'Код должен состоять из 6 цифр'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.verify2FA({
      email: props.email,
      code: code.value,
    })

    if (result.success) {
      emit('success')
    } else {
      error.value = result.message || 'Неверный код подтверждения'
    }
  } catch (err) {
    error.value = 'Произошла ошибка при проверке кода'
    console.error('2FA verification error:', err)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleHelp = () => {
  // Здесь можно добавить логику для помощи пользователю
  // Например, открыть модальное окно с инструкциями или перенаправить на страницу поддержки
  console.log('Help requested')
}

onMounted(() => {
  // Автофокус на поле ввода кода
  if (codeInput.value) {
    codeInput.value.focus()
  }
})
</script>

<style scoped>
/* Дополнительные стили, если необходимо */
</style>
