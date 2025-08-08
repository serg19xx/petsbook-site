import { createValidationRules } from './validation.js'

export const petValidationRules = createValidationRules({
  name: {
    required: { value: true, message: 'validation.required' },
    minLength: { value: 2, message: 'validation.minLength' },
    maxLength: { value: 100, message: 'validation.maxLength' },
  },

  species: {
    required: { value: true, message: 'validation.required' },
    maxLength: { value: 100, message: 'validation.maxLength' },
  },

  breed: {
    maxLength: { value: 100, message: 'validation.maxLength' },
  },

  gender: {
    required: { value: true, message: 'validation.required' },
  },

  dob: {
    date: { value: true, message: 'validation.date' },
  },

  color: {
    maxLength: { value: 50, message: 'validation.maxLength' },
  },

  description: {
    maxLength: { value: 1000, message: 'validation.maxLength' },
  },

  pet_size: {
    maxLength: { value: 45, message: 'validation.maxLength' },
  },

  yt_video: {
    url: { value: true, message: 'validation.url' },
  },
})

// Дополнительные валидаторы для питомцев
export const petCustomValidators = {
  ageRange: (value) => {
    if (!value) return true
    const age = Number(value)
    return age >= 0 && age <= 50
  },

  weightRange: (value) => {
    if (!value) return true
    const weight = Number(value)
    return weight >= 0 && weight <= 1000
  },
}
