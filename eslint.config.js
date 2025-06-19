import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-ignore',
    ignores: ['**/*'], // Игнорируем все файлы - отключаем ESLint
  },
]
