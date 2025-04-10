// Формат данных для отправки на сервер
const profileData = {
  // Personal Information
  fullName: 'John Doe',
  nickname: 'johndoe',
  role: 'petowner',
  gender: 'male',
  birthDate: '1990-01-01',
  avatar: 'https://example.com/avatar.jpg',

  // Contact Information
  phone: '+1234567890',
  website: 'https://example.com',

  // Location Information
  location: {
    fullAddress: '123 Main St, Apt 45, City',
    coordinates: {
      lat: 12.345678,
      lng: 98.765432,
    },
    components: {
      // Street Address
      street: 'Main St',
      houseNumber: '123',
      unit: '45',

      // Geographic Information
      city: 'City',
      district: 'District',
      region: 'Region',
      postcode: '12345',
      country: 'United States',
      countryCode: 'US',

      // Region Codes
      subdivisionCode: {
        alpha2: 'NY',
        alpha3: 'NYC',
      },
    },
  },
}

// Функция для отправки данных
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/api/profile', profileData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile')
  }
}
