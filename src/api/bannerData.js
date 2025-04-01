export const mockBanners = [
  {
    id: 1,
    type: 'promo',
    icon: 'mdi:paw',
    text: 'New Premium Pet Food: 30% off for first-time buyers',
    link: '/promo/pet-food',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 2,
    type: 'event',
    icon: 'mdi:calendar-heart',
    text: 'Pet Exhibition this Weekend - Free Entry!',
    link: '/events/pet-expo',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 3,
    type: 'service',
    icon: 'mdi:medical-bag',
    text: 'Veterinary Consultation: Book Online, Get 15% Discount',
    link: '/services/vet',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 4,
    type: 'adoption',
    icon: 'mdi:home-heart',
    text: 'Help Local Shelters: 50+ Pets Looking for Forever Homes',
    link: '/adoption',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 5,
    type: 'education',
    icon: 'mdi:school',
    text: 'Free Online Workshop: Pet Training Basics',
    link: '/education/training',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 6,
    type: 'partnership',
    icon: 'mdi:handshake',
    text: 'PetSmart Partnership: Extra 20% off with Member Card',
    link: '/partners/petsmart',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 7,
    type: 'community',
    icon: 'mdi:account-group',
    text: 'Join Local Pet Owner Community - Share Experience & Tips',
    link: '/community',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    id: 8,
    type: 'charity',
    icon: 'mdi:gift-outline',
    text: 'Donate to Animal Shelters: Every $1 Makes a Difference',
    link: '/charity',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
]

// Имитация API запроса
export const getBanners = async () => {
  // Имитация задержки сети
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockBanners
}

// Функция для получения активных баннеров
export const getActiveBanners = async () => {
  const banners = await getBanners()
  // Имитация фильтрации активных баннеров
  return banners.filter((banner) => Math.random() > 0.3) // Случайный выбор баннеров
}

// Функция для получения баннеров по типу
export const getBannersByType = async (type) => {
  const banners = await getBanners()
  return banners.filter((banner) => banner.type === type)
}
