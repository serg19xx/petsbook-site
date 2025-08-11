import { createValidationRules } from './validation.js'

export const petValidationRules = createValidationRules({
  name: {
    required: { value: true, message: 'required' },
    minLength: { value: 2, message: 'minLength' },
    maxLength: { value: 100, message: 'maxLength' },
  },

  species: {
    required: { value: true, message: 'required' },
    maxLength: { value: 100, message: 'maxLength' },
  },

  breed: {
    maxLength: { value: 100, message: 'maxLength' },
  },

  gender: {
    required: { value: true, message: 'required' },
  },

  dob: {
    date: { value: true, message: 'date' },
  },

  color: {
    maxLength: { value: 50, message: 'maxLength' },
  },

  description: {
    maxLength: { value: 1000, message: 'maxLength' },
  },

  pet_size: {
    maxLength: { value: 45, message: 'maxLength' },
  },

  yt_video: {
    url: { value: true, message: 'url' },
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
