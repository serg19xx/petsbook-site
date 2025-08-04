import api from './index'

// Mock данные для питомцев
const mockPets = [
  {
    id: 1,
    name: 'Buddy',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 25,
    color: 'Golden',
    microchip: 'CHIP123456789',
    status: 'active',
    photo: null,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: 2,
    name: 'Whiskers',
    type: 'cat',
    breed: 'Persian',
    age: 2,
    weight: 4.5,
    color: 'White',
    microchip: 'CHIP987654321',
    status: 'active',
    photo: null,
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-02-15T16:20:00Z',
  },
  {
    id: 3,
    name: 'Polly',
    type: 'bird',
    breed: 'African Grey',
    age: 5,
    weight: 0.4,
    color: 'Grey',
    microchip: null,
    status: 'active',
    photo: null,
    createdAt: '2023-12-05T11:00:00Z',
    updatedAt: '2024-01-25T13:30:00Z',
  },
]

export const petsApi = {
  // Получить список питомцев пользователя
  async fetchMyPets() {
    try {
      // Mock: имитируем задержку сети
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Возвращаем mock данные
      return {
        success: true,
        data: mockPets,
        message: 'Pets loaded successfully',
      }
    } catch (error) {
      console.error('Error fetching my pets:', error)
      throw error
    }
  },

  // Получить детали питомца по ID
  async fetchPetDetails(petId) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const pet = mockPets.find((p) => p.id === parseInt(petId))
      if (!pet) {
        throw new Error('Pet not found')
      }

      return {
        success: true,
        data: pet,
        message: 'Pet details loaded successfully',
      }
    } catch (error) {
      console.error('Error fetching pet details:', error)
      throw error
    }
  },

  // Создать нового питомца
  async createPet(petData) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const newPet = {
        id: Date.now(), // Простой способ генерации ID
        ...petData,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockPets.push(newPet)

      return {
        success: true,
        data: newPet,
        message: 'Pet created successfully',
      }
    } catch (error) {
      console.error('Error creating pet:', error)
      throw error
    }
  },

  // Обновить питомца
  async updatePet(petId, petData) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))

      const index = mockPets.findIndex((p) => p.id === parseInt(petId))
      if (index === -1) {
        throw new Error('Pet not found')
      }

      mockPets[index] = {
        ...mockPets[index],
        ...petData,
        updatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: mockPets[index],
        message: 'Pet updated successfully',
      }
    } catch (error) {
      console.error('Error updating pet:', error)
      throw error
    }
  },

  // Удалить питомца
  async deletePet(petId) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))

      const index = mockPets.findIndex((p) => p.id === parseInt(petId))
      if (index === -1) {
        throw new Error('Pet not found')
      }

      mockPets.splice(index, 1)

      return {
        success: true,
        message: 'Pet deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting pet:', error)
      throw error
    }
  },

  // Загрузить фото питомца
  async uploadPetPhoto(petId, file) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const index = mockPets.findIndex((p) => p.id === parseInt(petId))
      if (index === -1) {
        throw new Error('Pet not found')
      }

      // Имитируем загрузку фото
      const photoUrl = `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Pet+Photo`

      mockPets[index].photo = photoUrl
      mockPets[index].updatedAt = new Date().toISOString()

      return {
        success: true,
        data: { url: photoUrl },
        message: 'Photo uploaded successfully',
      }
    } catch (error) {
      console.error('Error uploading pet photo:', error)
      throw error
    }
  },
}
