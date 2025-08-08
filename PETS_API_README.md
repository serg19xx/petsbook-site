# Pets API - Инструкция по использованию

## Обзор

Система для работы с животными в PetsBook включает в себя полный набор функций для создания, просмотра, редактирования и удаления питомцев.

## Основные компоненты

### 1. API (src/api/pets.js)
- `fetchMyPets()` - Получить список питомцев текущего пользователя
- `fetchAllPets(params)` - Получить все питомцев с пагинацией и фильтрами
- `fetchPetDetails(petId)` - Получить детали конкретного питомца
- `createPet(petData)` - Создать нового питомца
- `updatePet(petId, petData)` - Обновить питомца
- `deletePet(petId)` - Удалить питомца
- `uploadPetPhoto(petId, file)` - Загрузить фото питомца
- `searchPets(searchParams)` - Поиск питомцев

### 2. Store (src/stores/PetsStore.js)
Централизованное управление состоянием питомцев с методами:
- `fetchMyPets()` - Загрузить моих питомцев
- `fetchAllPets(params)` - Загрузить всех питомцев
- `searchPets(searchParams)` - Поиск питомцев
- `addPet(petData)` - Добавить питомца
- `updatePet(petId, petData)` - Обновить питомца
- `deletePet(petId)` - Удалить питомца
- `uploadPetPhoto(petId, file)` - Загрузить фото

### 3. Компоненты
- `PetsListView.vue` - Список всех питомцев с фильтрами
- `PetCard.vue` - Карточка питомца для сетки
- `PetListItem.vue` - Элемент списка питомцев
- `MyPetCard.vue` - Карточка моего питомца с действиями
- `Pagination.vue` - Компонент пагинации

### 4. Страницы
- `/pets` - Список всех питомцев
- `/pets/:id` - Детали питомца
- `/my-pets` - Мои питомцы

## Использование

### Получение списка животных

```javascript
import { usePetsStore } from '@/stores/PetsStore'

const petsStore = usePetsStore()

// Загрузить моих питомцев
await petsStore.fetchMyPets()

// Загрузить всех питомцев с фильтрами
await petsStore.fetchAllPets({
  page: 1,
  search: 'Buddy',
  species: 'dog',
  size: 'medium',
  gender: 'Boy'
})

// Поиск питомцев
await petsStore.searchPets({
  search: 'Golden Retriever',
  species: 'dog'
})
```

### Создание нового питомца

```javascript
const newPet = await petsStore.addPet({
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  gender: 'Boy',
  color: 'Golden',
  pet_size: 'large',
  description: 'Friendly and energetic dog',
  published: 1
})
```

### Обновление питомца

```javascript
const updatedPet = await petsStore.updatePet(petId, {
  name: 'Buddy Jr.',
  description: 'Updated description'
})
```

### Удаление питомца

```javascript
await petsStore.deletePet(petId)
```

### Загрузка фото

```javascript
const file = event.target.files[0]
const photoData = await petsStore.uploadPetPhoto(petId, file)
```

## Структура данных питомца

```javascript
{
  id: 1,
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  gender: 'Boy',
  color: 'Golden',
  pet_size: 'large',
  dob: '2020-01-15',
  description: 'Friendly and energetic dog',
  photo: 'https://example.com/photo.jpg',
  yt_video: 'https://youtube.com/watch?v=...',
  published: 1,
  views: 42,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
  owner: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }
}
```

## Фильтры и поиск

Поддерживаемые параметры фильтрации:
- `search` - Поиск по имени и породе
- `species` - Вид животного (dog, cat, bird, fish, hamster, rabbit, other)
- `size` - Размер (small, medium, large)
- `gender` - Пол (Boy, Girl)
- `page` - Номер страницы
- `limit` - Количество элементов на странице

## Локализация

Все тексты поддерживают локализацию через ключи в `src/locales/en.json`:
- `UI.pets.types.*` - Виды животных
- `UI.pets.sizes.*` - Размеры
- `UI.pets.genders.*` - Пол
- `UI.pets.status.*` - Статусы
- `UI.pets.actions.*` - Действия

## Обработка ошибок

Все методы API включают обработку ошибок:
```javascript
try {
  await petsStore.fetchMyPets()
} catch (error) {
  console.error('Error:', error.message)
  // Показать уведомление пользователю
}
```

## Производительность

- Ленивая загрузка изображений
- Пагинация для больших списков
- Debounced поиск (500ms задержка)
- Кэширование в store
- Оптимизированные запросы к API 