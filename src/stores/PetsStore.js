import { ref } from 'vue'
import { defineStore } from 'pinia'
import { petsApi } from '@/api/pets'

export const usePetsStore = defineStore('pets', () => {
  const pets = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalPets = ref(0)
  const currentPage = ref(1)
  const searchQuery = ref('')

  // Получить список питомцев пользователя
  async function fetchMyPets() {
    console.log('🔄 fetchMyPets called - this might cause flickering')
    loading.value = true
    error.value = null
    try {
      const response = await petsApi.fetchMyPets()
      pets.value = response?.data?.pets || []
      totalPets.value = response?.data?.total_count || pets.value.length
      console.log('✅ fetchMyPets completed, loaded', pets.value.length, 'pets')
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to load pets'
      console.error('Error fetching my pets:', err)
    } finally {
      loading.value = false
    }
  }

  // Получить все питомцев (с пагинацией и фильтрами)
  async function fetchAllPets(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await petsApi.fetchAllPets(params)
      pets.value = response?.data || []
      totalPets.value = response?.total || 0
      currentPage.value = params.page || 1
      searchQuery.value = params.search || ''
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to load pets'
      console.error('Error fetching all pets:', err)
    } finally {
      loading.value = false
    }
  }

  // Поиск питомцев
  async function searchPets(searchParams) {
    loading.value = true
    error.value = null
    try {
      const response = await petsApi.searchPets(searchParams)
      pets.value = response?.data || []
      totalPets.value = response?.total || 0
      searchQuery.value = searchParams.search || ''
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to search pets'
      console.error('Error searching pets:', err)
    } finally {
      loading.value = false
    }
  }

  // Добавить нового питомца
  async function addPet(petData) {
    loading.value = true
    error.value = null
    try {
      const response = await petsApi.createPet(petData)
      const newPet = response?.data
      if (newPet) {
        pets.value.unshift(newPet) // Добавляем в начало списка
        totalPets.value++
      }
      return newPet
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to add pet'
      console.error('Error adding pet:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновить питомца
  async function updatePet(petId, petData) {
    loading.value = true
    error.value = null
    try {
      const response = await petsApi.updatePet(petId, petData)
      const updatedPet = response?.data
      if (updatedPet) {
        const idx = pets.value.findIndex((p) => p.id === petId)
        if (idx !== -1) {
          pets.value[idx] = updatedPet
        }
      }
      return updatedPet
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to update pet'
      console.error('Error updating pet:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удалить питомца
  async function deletePet(petId) {
    loading.value = true
    error.value = null
    try {
      await petsApi.deletePet(petId)
      pets.value = pets.value.filter((p) => p.id !== petId)
      totalPets.value = Math.max(0, totalPets.value - 1)
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to delete pet'
      console.error('Error deleting pet:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Загрузить фото питомца
  async function uploadPetPhoto(petId, file, filename = null) {
    loading.value = true
    error.value = null
    try {
      const response = await petsApi.uploadPetPhoto(petId, file, filename)

      // Если получили новый pet_id (создался новый питомец)
      if (response?.petId && petId === 0) {
        return { petId: response.petId, ...response }
      }

      return response
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to upload photo'
      console.error('Error uploading pet photo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удалить фото питомца
  async function deletePetPhoto(petId, filename, userId = null) {
    loading.value = true
    error.value = null
    try {
      const response = await petsApi.deletePetPhoto(petId, filename, userId)

      // Обновляем данные питомца в store
      const pet = getPetById(petId)
      if (pet && pet.main_photos) {
        pet.main_photos = pet.main_photos.filter((photo) => photo.filename !== filename)
      }

      return response
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to delete photo'
      console.error('Error deleting pet photo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получить питомца по ID
  function getPetById(petId) {
    return pets.value.find((p) => p.id === petId)
  }

  // Обновить статус питомца
  async function updatePetStatus(petId, status) {
    // УБИРАЕМ loading для этой операции - она быстрая и не должна вызывать мерцание
    // loading.value = true
    error.value = null
    try {
      console.log('🔄 updatePetStatus called with petId:', petId, 'status:', status)

      const response = await petsApi.updatePetStatus(petId, status)
      console.log('🔄 updatePetStatus response:', response)

      // Обновляем данные в store БЕЗ МЕРЦАНИЯ
      const idx = pets.value.findIndex((p) => p.id === petId)
      console.log(' Found pet at index:', idx)

      if (idx !== -1) {
        const petInStore = pets.value[idx]

        // Если сервер вернул обновленные данные, обновляем только нужные свойства
        if (response?.data) {
          const updatedPetData = response.data.pet || response.data

          // Обновляем только статус, не заменяя весь объект
          if (updatedPetData.published !== undefined) {
            petInStore.published = updatedPetData.published
          }

          // Обновляем другие свойства если они есть
          if (updatedPetData.name !== undefined) petInStore.name = updatedPetData.name
          if (updatedPetData.species !== undefined) petInStore.species = updatedPetData.species
          if (updatedPetData.breed !== undefined) petInStore.breed = updatedPetData.breed
          if (updatedPetData.gender !== undefined) petInStore.gender = updatedPetData.gender
          if (updatedPetData.dob !== undefined) petInStore.dob = updatedPetData.dob
          if (updatedPetData.color !== undefined) petInStore.color = updatedPetData.color
          if (updatedPetData.description !== undefined)
            petInStore.description = updatedPetData.description
          if (updatedPetData.pet_size !== undefined) petInStore.pet_size = updatedPetData.pet_size

          console.log('✅ Updated pet properties in store:', updatedPetData)
        } else {
          // Иначе обновляем только статус локально
          petInStore.published = status
          console.log('✅ Updated pet status locally:', status)
        }
      }

      // Возвращаем обновленный питомец из store
      const result = pets.value[idx]
      console.log('🔄 Returning updated pet from store:', result)
      return result
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Failed to update pet status'
      console.error('Error updating pet status:', err)
      throw err
    }
    // УБИРАЕМ finally блок - не нужно сбрасывать loading
    // } finally {
    //   loading.value = false
    // }
  }

  // Очистить ошибки
  function clearError() {
    error.value = null
  }

  // Сбросить состояние
  function reset() {
    pets.value = []
    loading.value = false
    error.value = null
    totalPets.value = 0
    currentPage.value = 1
    searchQuery.value = ''
  }

  return {
    // State
    pets,
    loading,
    error,
    totalPets,
    currentPage,
    searchQuery,

    // Actions
    fetchMyPets,
    fetchAllPets,
    searchPets,
    addPet,
    updatePet,
    updatePetStatus, // Добавляем новую функцию
    deletePet,
    uploadPetPhoto,
    deletePetPhoto, // Добавляем новую функцию
    getPetById,
    clearError,
    reset,
  }
})
