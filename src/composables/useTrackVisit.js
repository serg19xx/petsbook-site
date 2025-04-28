import { onMounted } from 'vue'
import { apiService } from '@/api/index'

function getClientVisitInfo() {
  return {
    language: navigator.language,
    referrer: document.referrer,
    visitTime: new Date().toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent,
    url: window.location.href,
  }
}

export function useTrackVisit() {
  onMounted(() => {
    const payload = getClientVisitInfo()
    apiService.trackVisit(payload)
  })
}
