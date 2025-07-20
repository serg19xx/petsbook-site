import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/',
  server: {
    historyApiFallback: true,
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Убедитесь, что это правильный порт вашего PHP сервера
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: ['localhost', '.loca.lt', '.ngrok-free.app'],
  },
  preview: {
    host: true,
    allowedHosts: ['.loca.lt'], // Также для preview, если вы его используете
  },
  esbuild: { drop: [] },
})
