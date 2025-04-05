import { toast } from 'vue3-toastify'
import i18n from '@/i18n'

const { t } = i18n.global

export const showNotification = {
  success(message) {
    toast.success(t(message), {
      position: 'top-right',
      theme: 'colored',
    })
  },

  error(message) {
    toast.error(t(message), {
      position: 'top-right',
      theme: 'colored',
    })
  },

  warning(message) {
    toast.warning(t(message), {
      position: 'top-right',
      theme: 'colored',
    })
  },

  info(message) {
    toast.info(t(message), {
      position: 'top-right',
      theme: 'colored',
    })
  },
}
