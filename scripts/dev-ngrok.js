// scripts/dev-ngrok.js
//const ngrok = require('ngrok')
import ngrok from 'ngrok'
import fs from 'fs'

//const apiUrl = import.meta.env.VITE_API_URL

async function start() {
  try {
    // Запускаем туннель для фронта (Vite)
    const frontendUrl = await ngrok.connect({ addr: 5173, authtoken_from_env: true })
    console.log('🌐 Frontend доступен по адресу:', frontendUrl)

    // Запускаем туннель для API (если нужно)
    const backendUrl = await ngrok.connect({ addr: 8080, authtoken_from_env: true })
    console.log('🔗 Backend доступен по адресу:', backendUrl)

    // Генерируем .env.ngrok с адресом API
    fs.writeFileSync('.env.ngrok', `VITE_API_URL=${backendUrl}\n`)
    console.log('✅ Создан файл .env.ngrok с адресом API:', backendUrl)

    // Можно автоматически копировать ссылку в буфер обмена (требует npm i clipboardy)
    // const clipboardy = require('clipboardy');
    // clipboardy.writeSync(frontendUrl);
    // console.log('Ссылка скопирована в буфер обмена!');
  } catch (err) {
    console.error('Ошибка запуска ngrok:', err)
  }
}

start()
