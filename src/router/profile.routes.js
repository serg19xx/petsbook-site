export const profileRoutes = [
  {
    path: '/profile',
    component: () => import('@/views/UserProfileView.vue'),
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('@/views/Profile/ProfileOverview.vue')
      },
      {
        path: 'edit',
        name: 'profile-edit',
        component: () => import('@/views/Profile/EditProfileView.vue')
      },
      // Pet Owner Routes
      {
        path: 'pets',
        name: 'profile-pets',
        component: () => import('@/views/Profile/PetOwner/PetsGallery.vue'),
        meta: { requiresRole: 'petowner' }
      },
      {
        path: 'galleries',
        name: 'profile-galleries',
        component: () => import('@/views/Profile/PetOwner/PhotoGalleries.vue'),
        meta: { requiresRole: 'petowner' }
      },
      // Business Routes
      {
        path: 'companies',
        name: 'profile-companies',
        component: () => import('@/views/Profile/Business/Companies.vue'),
        meta: { requiresRole: 'business' }
      },
      {
        path: 'services',
        name: 'profile-services',
        component: () => import('@/views/Profile/Business/Services.vue'),
        meta: { requiresRole: 'business' }
      },
      // Producer Routes
      {
        path: 'agency',
        name: 'profile-agency',
        component: () => import('@/views/Profile/Producer/Agency.vue'),
        meta: { requiresRole: 'producer' }
      },
      {
        path: 'castings',
        name: 'profile-castings',
        component: () => import('@/views/Profile/Producer/Castings.vue'),
        meta: { requiresRole: 'producer' }
      }
    ]
  }
]