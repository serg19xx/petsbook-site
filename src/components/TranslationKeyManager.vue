<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center p-6 border-b flex-shrink-0">
        <h2 class="text-xl font-semibold">Translation Key Manager</h2>
        <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>
      <div class="flex-1 overflow-hidden flex flex-col p-4">
        <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-4 flex-shrink-0">
          <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
            <label class="font-medium text-sm">Namespace:</label>
            <select v-model="selectedNamespace" class="border rounded px-2 py-1 text-sm w-full sm:w-auto">
              <option value="">All</option>
              <option v-for="ns in namespaces" :key="ns" :value="ns">{{ ns }}</option>
            </select>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
            <label class="font-medium text-sm">Search:</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by key name or value..."
              class="border rounded px-2 py-1 text-sm w-full sm:w-64"
            />
          </div>
          <button
            @click="openAddDialog"
            class="w-full sm:w-auto px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <Icon icon="mdi:plus" class="w-4 h-4 inline mr-1" />
            Add Key
          </button>
        </div>
        <div class="flex-1 overflow-y-auto min-h-0">
          <div class="space-y-2">
            <div
              v-for="key in filteredKeys"
              :key="key.id"
              class="p-3 border rounded-lg bg-gray-50 hover:bg-blue-50 flex flex-col gap-1 relative"
            >
              <div class="font-bold text-blue-700 text-sm">{{ key.namespace }}</div>
              <div class="font-semibold text-gray-800 text-sm break-all">{{ key.key_name }}</div>
              <div class="font-medium text-green-700 text-sm break-all">{{ key.english_value || key.value }}</div>
              <div class="text-xs text-gray-500 break-all">{{ key.description }}</div>
              <div class="flex gap-1 mt-2 sm:absolute sm:top-2 sm:right-2 sm:mt-0">
                <button
                  @click="deleteKey(key)"
                  class="text-red-500 hover:text-red-700 p-1"
                  title="Delete key"
                >
                  <Icon icon="mdi:delete" class="w-4 h-4" />
                </button>
                <button
                  @click="openEditDialog(key)"
                  class="text-gray-500 hover:text-blue-600 p-1"
                  title="Edit key"
                >
                  <Icon icon="mdi:pencil" class="w-4 h-4" />
                </button>
              </div>
            </div>
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
const searchQuery = ref('')

const namespaces = computed(() => {
  const set = new Set(keys.value.map(k => k.namespace))
  return Array.from(set).sort()
})

const filteredKeys = computed(() =>
  keys.value.filter(
    k =>
      (!selectedNamespace.value || k.namespace === selectedNamespace.value) &&
      (!searchQuery.value ||
        k.key_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (k.english_value && k.english_value.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (k.value && k.value.toLowerCase().includes(searchQuery.value.toLowerCase()))
      )
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