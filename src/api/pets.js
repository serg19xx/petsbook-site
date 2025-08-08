import api from './index'

export const petsApi = {
  // Получить список питомцев пользователя
  async fetchMyPets() {
    const response = await api.get('/api/pets/my-pets', { withCredentials: true })
    return response.data
  },

  // Получить детали питомца по ID
  async fetchPetDetails(petId) {
    const response = await api.get(`/api/pets/${petId}`, { withCredentials: true })
    return response.data
  },

  // Создать нового питомца
  async createPet(petData) {
    const response = await api.post('/api/pets', petData, { withCredentials: true })
    return response.data
  },

  // Обновить питомца
  async updatePet(petId, petData) {
    const response = await api.put(`/api/pets/${petId}`, petData, { withCredentials: true })
    return response.data
  },

  // Удалить питомца
  async deletePet(petId) {
    const response = await api.delete(`/api/pets/${petId}`, { withCredentials: true })
    return response.data
  },

  // Загрузить фото питомца (petId = 0 для создания нового)
  async uploadPetPhoto(petId, file, filename = null) {
    console.log('🚀 uploadPetPhoto called with:', {
      petId,
      filename,
      fileInfo: {
        name: file?.name,
        size: file?.size,
        type: file?.type,
      },
      fileExists: !!file,
      fileType: typeof file,
    })

    // КРИТИЧЕСКАЯ ПРОВЕРКА
    if (!file) {
      console.error('❌ No file provided to uploadPetPhoto!')
      throw new Error('File is required for photo upload')
    }

    // 🔥 ПРОВЕРКА РАЗМЕРА ФАЙЛА (макс 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 10MB)`)
    }

    // 🔥 ПРОВЕРКА ТИПА ФАЙЛА
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`)
    }

    const formData = new FormData()
    formData.append('photo', file)
    formData.append('pet_id', petId)

    if (filename) {
      formData.append('filename', filename)
      console.log('🔄 REPLACING existing file:', filename)
    } else {
      console.log('➕ ADDING new file')
    }

    // Дополнительная отладка
    console.log('📊 Request details:', {
      petId: petId,
      filename: filename || 'null',
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
      operation: filename ? 'REPLACE' : 'ADD',
    })

    // Отладка FormData
    console.log('📦 FormData contents:')
    for (let [key, value] of formData.entries()) {
      console.log(
        `  ${key}:`,
        typeof value === 'object'
          ? `File(${value.name}, ${value.size} bytes, ${value.type})`
          : value,
      )
    }

    const response = await api.post('/api/pets/photo/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    })
    return response.data
  },

  // Удалить фото питомца
  async deletePetPhoto(petId, filename, userId = null) {
    console.log('🗑️ deletePetPhoto called with:', {
      petId,
      filename,
      userId,
    })

    const requestData = {
      pet_id: petId,
      filename: filename,
    }

    // Добавляем user_id если передан
    if (userId) {
      requestData.user_id = userId
    }

    const response = await api.post('/api/pets/photo/delete', requestData, {
      withCredentials: true,
    })
    return response.data
  },

  // Получить все питомцев (для админов или публичный список)
  async fetchAllPets(params = {}) {
    const response = await api.get('/api/pets', { params, withCredentials: true })
    return response.data
  },

  // Поиск питомцев
  async searchPets(searchParams) {
    const response = await api.get('/api/pets/search', {
      params: searchParams,
      withCredentials: true,
    })
    return response.data
  },

  // Обновить статус питомца (публикация)
  async updatePetStatus(petId, status) {
    console.log('🔄 updatePetStatus called with:', {
      petId,
      status,
    })

    const response = await api.patch(
      `/api/pets/${petId}/status`,
      { published: status },
      { withCredentials: true },
    )
    console.log('✅ updatePetStatus response:', response.data)
    return response.data
  },
}
