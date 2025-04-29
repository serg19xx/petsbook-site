<template>
  <div class="p-4">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold mb-4">Настройки безопасности</h2>

      <!-- 2FA Section -->
      <div class="bg-white rounded-lg shadow p-4 mb-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium">Двухфакторная аутентификация</h3>
            <p class="text-gray-600 text-sm">
              {{ is2FAEnabled ? 'Включена' : 'Отключена' }}
            </p>
          </div>
          <Button
            :label="is2FAEnabled ? 'Отключить' : 'Включить'"
            :severity="is2FAEnabled ? 'danger' : 'success'"
            @click="handle2FAToggle"
            :loading="loading"
          />
        </div>
      </div>

      <!-- QR Code Dialog -->
      <Dialog
        v-model:visible="showQRDialog"
        modal
        header="Настройка двухфакторной аутентификации"
        :closable="false"
        :style="{ width: '400px' }"
      >
        <div class="text-center">
          <div v-if="qrCode" class="mb-4">
            <img :src="qrCode" alt="QR Code" class="mx-auto" />
            <p class="mt-2 text-sm text-gray-600">Секретный ключ: {{ secret }}</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Введите код подтверждения
            </label>
            <InputText v-model="verificationCode" class="w-full" placeholder="000000" />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <Button label="Отмена" severity="secondary" @click="cancelSetup" :disabled="loading" />
            <Button label="Подтвердить" @click="confirmSetup" :loading="loading" />
          </div>
        </template>
      </Dialog>

      <!-- Toast для уведомлений -->
      <Toast position="top-right" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'

const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const is2FAEnabled = ref(false)
const showQRDialog = ref(false)
const qrCode = ref('')
const secret = ref('')
const verificationCode = ref('')

// Получение статуса 2FA при загрузке компонента
const checkStatus = async () => {
  loading.value = true
  const response = await authStore.get2FAStatus()
  is2FAEnabled.value = response.enabled
  loading.value = false
}

// Обработка включения/выключения 2FA
const handle2FAToggle = async () => {
  if (is2FAEnabled.value) {
    await disable2FA()
  } else {
    await enable2FA()
  }
}

// Включение 2FA
const enable2FA = async () => {
  loading.value = true
  const response = await authStore.enable2FA()

  if (response.success) {
    qrCode.value = response.data.qr_code
    secret.value = response.data.secret
    showQRDialog.value = true
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: response.message,
      life: 3000,
    })
  }
  loading.value = false
}

// Подтверждение настройки 2FA
const confirmSetup = async () => {
  loading.value = true
  const response = await authStore.verify2FA(verificationCode.value)

  if (response.success) {
    is2FAEnabled.value = true
    showQRDialog.value = false
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Двухфакторная аутентификация включена',
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: response.message,
      life: 3000,
    })
  }
  loading.value = false
}

// Отключение 2FA
const disable2FA = async () => {
  loading.value = true
  const response = await authStore.disable2FA()

  if (response.success) {
    is2FAEnabled.value = false
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Двухфакторная аутентификация отключена',
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: response.message,
      life: 3000,
    })
  }
  loading.value = false
}

// Отмена настройки 2FA
const cancelSetup = async () => {
  if (showQRDialog.value) {
    await authStore.disable2FA()
  }
  showQRDialog.value = false
  verificationCode.value = ''
}

onMounted(() => {
  checkStatus()
})
</script>
