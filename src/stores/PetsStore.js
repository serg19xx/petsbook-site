import { ref } from 'vue'
import { defineStore } from 'pinia'
import { petsApi } from '@/api/pets'

export const usePetsStore = defineStore('pets', () => {
  const pets = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchMyPets() {
    loading.value = true
    error.value = null
    try {
      const data = await petsApi.fetchMyPets()
      pets.value = data?.data || []
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to load pets'
    } finally {
      loading.value = false
    }
  }

  async function addPet(petData) {
    loading.value = true
    error.value = null
    try {
      const data = await petsApi.createPet(petData)
      pets.value.push(data?.data)
      return data?.data
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to add pet'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePet(petId, petData) {
    loading.value = true
    error.value = null
    try {
      const data = await petsApi.updatePet(petId, petData)
      const idx = pets.value.findIndex((p) => p.id === petId)
      if (idx !== -1) pets.value[idx] = data?.data
      return data?.data
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to update pet'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePet(petId) {
    loading.value = true
    error.value = null
    try {
      await petsApi.deletePet(petId)
      pets.value = pets.value.filter((p) => p.id !== petId)
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to delete pet'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    pets,
    loading,
    error,
    fetchMyPets,
    addPet,
    updatePet,
    deletePet,
  }
})
