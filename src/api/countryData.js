// Mock data for countries with their languages and flags
export const mockCountries = [
  // Europe
  {
    code: 'GB',
    name: 'United Kingdom',
    languages: [{ code: 'en', name: 'English' }],
    flag: 'flag:gb-4x3',
    region: 'Europe',
  },
  {
    code: 'FR',
    name: 'France',
    languages: [{ code: 'fr', name: 'French' }],
    flag: 'flag:fr-4x3',
    region: 'Europe',
  },
  {
    code: 'DE',
    name: 'Germany',
    languages: [{ code: 'de', name: 'German' }],
    flag: 'flag:de-4x3',
    region: 'Europe',
  },
  {
    code: 'ES',
    name: 'Spain',
    languages: [{ code: 'es', name: 'Spanish' }],
    flag: 'flag:es-4x3',
    region: 'Europe',
  },
  {
    code: 'IT',
    name: 'Italy',
    languages: [{ code: 'it', name: 'Italian' }],
    flag: 'flag:it-4x3',
    region: 'Europe',
  },
  {
    code: 'RU',
    name: 'Russian Federation',
    languages: [{ code: 'ru', name: 'Russian' }],
    flag: 'flag:ru-4x3',
    region: 'Europe',
  },
  {
    code: 'UA',
    name: 'Ukraine',
    languages: [{ code: 'uk', name: 'Ukrainian' }],
    flag: 'flag:ua-4x3',
    region: 'Europe',
  },
  {
    code: 'PL',
    name: 'Poland',
    languages: [{ code: 'pl', name: 'Polish' }],
    flag: 'flag:pl-4x3',
    region: 'Europe',
  },

  // Asia
  {
    code: 'CN',
    name: 'China',
    languages: [{ code: 'zh', name: 'Chinese' }],
    flag: 'flag:cn-4x3',
    region: 'Asia',
  },
  {
    code: 'JP',
    name: 'Japan',
    languages: [{ code: 'ja', name: 'Japanese' }],
    flag: 'flag:jp-4x3',
    region: 'Asia',
  },
  {
    code: 'KR',
    name: 'Korea, Republic of',
    languages: [{ code: 'ko', name: 'Korean' }],
    flag: 'flag:kr-4x3',
    region: 'Asia',
  },

  // Americas
  {
    code: 'US',
    name: 'United States',
    languages: [{ code: 'en', name: 'English' }],
    flag: 'flag:us-4x3',
    region: 'Americas',
  },
  {
    code: 'CA',
    name: 'Canada',
    languages: [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'French' },
    ],
    flag: 'flag:ca-4x3',
    region: 'Americas',
  },
  {
    code: 'BR',
    name: 'Brazil',
    languages: [{ code: 'pt', name: 'Portuguese' }],
    flag: 'flag:br-4x3',
    region: 'Americas',
  },
  {
    code: 'MX',
    name: 'Mexico',
    languages: [{ code: 'es', name: 'Spanish' }],
    flag: 'flag:mx-4x3',
    region: 'Americas',
  },
]

// Group countries by region
export const getCountriesByRegion = () => {
  return mockCountries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = []
    }
    acc[country.region].push(country)
    return acc
  }, {})
}

// Get country by code
export const getCountryByCode = (code) => {
  return mockCountries.find((country) => country.code === code)
}

// Get languages for country
export const getLanguagesForCountry = (countryCode) => {
  const country = getCountryByCode(countryCode)
  return country ? country.languages : []
}
