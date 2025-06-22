<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold">Translation Key Manager</h2>
        <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>
      <div class="p-4 flex flex-col gap-4">
        <div class="flex gap-2 items-center">
          <label class="font-medium">Namespace:</label>
          <select v-model="selectedNamespace" class="border rounded px-2 py-1">
            <option value="">All</option>
            <option v-for="ns in namespaces" :key="ns" :value="ns">{{ ns }}</option>
          </select>
          <button
            @click="openAddDialog"
            class="ml-auto px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <Icon icon="mdi:plus" class="w-4 h-4 inline mr-1" />
            Add Key
          </button>
        </div>
        <div class="space-y-2 overflow-y-auto" style="max-height: 60vh;">
          <div
            v-for="key in filteredKeys"
            :key="key.id"
            class="p-3 border rounded-lg bg-gray-50 hover:bg-blue-50 flex flex-col gap-1 relative"
          >
            <div class="font-bold text-blue-700">{{ key.namespace }}</div>
            <div class="font-semibold text-gray-800">{{ key.key_name }}</div>
            <div class="font-medium text-green-700">
              {{ key.english_value || key.value }}
            </div>
            <div class="text-xs text-gray-500">{{ key.description }}</div>
            <button
              @click="deleteKey(key)"
              class="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete key"
            >
              <Icon icon="mdi:delete" class="w-4 h-4" />
            </button>
            <button
              @click="openEditDialog(key)"
              class="absolute top-2 right-8 text-gray-500 hover:text-blue-600"
              title="Edit key"
            >
              <Icon icon="mdi:pencil" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <AddNewKeyDialog
        :is-visible="showKeyDialog"
        :key-id="editKeyId"
        :key-data="editKeyData"
        @close="closeKeyDialog"
        @key-added="onKeyChanged"
        @key-updated="onKeyChanged"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { toast } from 'vue3-toastify'
import api from '@/api'
import AddNewKeyDialog from './AddNewKeyDialog.vue'

const props = defineProps({ isVisible: Boolean })
const emit = defineEmits(['close'])

const keys = ref([])
const selectedNamespace = ref('')
const showKeyDialog = ref(false)
const editKeyId = ref(0)
const editKeyData = ref(null)

const namespaces = computed(() => {
  const set = new Set(keys.value.map(k => k.namespace))
  return Array.from(set).sort()
})

const filteredKeys = computed(() =>
  keys.value.filter(
    k =>
      (!selectedNamespace.value || k.namespace === selectedNamespace.value)
  )
)

function closeDialog() {
  emit('close')
}

function openAddDialog() {
  editKeyId.value = 0
  editKeyData.value = null
  showKeyDialog.value = true
}

function openEditDialog(key) {
  editKeyId.value = key.id || key.key_id
  editKeyData.value = { ...key }
  showKeyDialog.value = true
}

function closeKeyDialog() {
  showKeyDialog.value = false
}

function onKeyChanged() {
  showKeyDialog.value = false
  loadKeys()
}

function deleteKey(key) {
  if (!confirm('Delete this key and all its translations?')) return
  api.post('/i18n/delete-translation-key', { key_id: key.key_id || key.id })
    .then(() => {
      toast.success('Key deleted')
      loadKeys()
    })
    .catch(() => toast.error('Failed to delete key'))
}

async function loadKeys() {
  const res = await api.get('/i18n/all-translation-keys')
  if (res.data.status === 200) {
    keys.value = res.data.data.keys
  }
}

watch(() => props.isVisible, (val) => {
  if (val) loadKeys()
})
</script>