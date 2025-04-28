import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: true /*[
      'localhost',
      '10.0.0.241',
      '.loca.lt',
      '.ngrok.io',
      '.trycloudflare.com',
      '.serveo.net',
      '6385c8e185119ac1ab51b0656b0be6d2.serveo.net',
    ],*/,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
  },
})
