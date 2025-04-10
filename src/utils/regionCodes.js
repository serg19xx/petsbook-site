// Mapping for region codes
export const regionCodesMap = {
  // United States
  'US-AL': 'ALA', // Alabama
  'US-AK': 'ALK', // Alaska
  'US-AZ': 'ARZ', // Arizona
  'US-AR': 'ARK', // Arkansas
  'US-CA': 'CAL', // California
  'US-CO': 'COL', // Colorado
  // ... другие штаты США

  // Russia
  'RU-MOW': 'MOW', // Moscow
  'RU-SPE': 'SPE', // Saint Petersburg
  'RU-KDA': 'KDA', // Krasnodar Krai
  // ... другие регионы России

  // Germany
  'DE-BW': 'BWU', // Baden-Württemberg
  'DE-BY': 'BAY', // Bavaria
  'DE-BE': 'BER', // Berlin
  // ... другие регионы Германии

  // Add more countries and regions as needed
}

// Function to get alpha-3 code from alpha-2
export const getAlpha3RegionCode = (alpha2Code) => {
  return regionCodesMap[alpha2Code] || alpha2Code
}

// Validate region code
export const isValidRegionCode = (alpha2Code) => {
  return alpha2Code && regionCodesMap.hasOwnProperty(alpha2Code)
}
