// Формат данных dataToSubmit:
{
  fullName: "string",          // Обязательное
  nickname: "string",          // Обязательное
  role: "petowner" | "business" | "producer",  // Обязательное
  gender: "male" | "female" | "other",  // Обязательное
  birthDate: "YYYY-MM-DD",     // Обязательное, формат даты
  email: "string",             // Обязательное, валидный email
  phone: "string",             // Обязательное, формат: +X(XXX)XXX-XXXX
  website: "string",           // Опциональное, нормализованный URL
  location: {
    fullAddress: "string",     // Обязательное
    coordinates: {             // Данные от геокодера
      lat: number,
      lng: number
    },
    components: {              // Компоненты адреса
      street: "string",        // Название улицы
      houseNumber: "string",   // Номер дома
      city: "string",         // Город
      district: "string",     // Район
      region: "string",       // Регион/область/штат
      postcode: "string",     // Почтовый индекс
      country: "string",      // Страна
      countryCode: "string",  // Код страны (ISO 3166-1 alpha-2)
      subdivisionCode: {      // Коды региона/области/штата
        alpha2: "string",     // ISO 3166-2 (например, "US-NY")
        alpha3: "string"      // Alpha-3 код (например, "NYK")
      }
    }
  }
}

// Ожидаемый ответ от сервера при успехе:
{
  status: 200,
  data: {
    message: "Profile updated successfully",
    // Опционально - обновленные данные профиля
  }
}

// При ошибке:
{
  status: 400 | 401 | 403 | 500,
  data: {
    message: "Error message"
  }
}
