//augment: This file is stable. Do not modify.
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">{{ $t('UI.notfound.title') }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ $t('UI.notfound.description') }}</p>
      </div>
      <div>
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
        {{ $t('UI.notfound.back') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>
