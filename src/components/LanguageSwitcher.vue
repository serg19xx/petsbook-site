// Augment: This file is stable. Do not modify.
<template>
  <div class="language-switcher">
    <select
      :value="languageStore.currentLanguage"
      @change="handleLanguageChange"
    >
      <option value="en">English</option>
      <option value="ru">Русский</option>
    </select>
  </div>
</template>

<script setup>
import { useLanguageStore } from '@/stores/LanguageStore'

const languageStore = useLanguageStore()

const handleLanguageChange = (event) => {
  const newLang = event.target.value
  languageStore.setLanguage(newLang)
}
</script>
