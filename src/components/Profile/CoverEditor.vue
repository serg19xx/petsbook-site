<template>
  <div class="cover-editor">
    <div class="editor-area">
      <div
        class="relative w-full h-[300px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-t-lg overflow-hidden"
        @mousedown="startDrag"
        @mousemove="drag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @touchstart="startDrag"
        @touchmove="drag"
        @touchend="stopDrag"
      >
        <!-- Прямоугольная маска -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[851px] h-[105px] overflow-hidden border-2 border-white/80 shadow-lg">
            <canvas
              v-if="imageUrl"
              ref="canvasRef"
              width="851"
              height="105"
              class="w-full h-full"
            ></canvas>
            <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm">
              <Icon icon="mdi:image" class="w-12 h-12 text-gray-400 mb-2" />
              <p class="text-sm text-gray-500">Нажмите для выбора фото</p>
            </div>
            <img
              v-if="imageUrl"
              ref="imageRef"
              :src="imageUrl"
              @load="drawImage"
              class="hidden"
            />
          </div>
        </div>
      </div>

      <!-- Панель инструментов -->
      <div class="tools-panel p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex items-center justify-between rounded-b-lg">
        <div class="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
            ref="fileInput"
          />
          <button
            @click="$refs.fileInput.click()"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            :title="t('UI.photoeditor.tooltip.selectPhoto')"
          >
            <Icon icon="mdi:image-plus" class="w-6 h-6 text-gray-600" />
          </button>
          <button
            v-if="imageUrl"
            @click="centerImage"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            :title="t('UI.photoeditor.tooltip.center')"
          >
            <Icon icon="mdi:image-filter-center-focus" class="w-6 h-6 text-gray-600" />
          </button>
          <button
            v-if="imageUrl"
            @click="rotateLeft"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            :title="t('UI.photoeditor.tooltip.rotateLeft')"
          >
            <Icon icon="mdi:rotate-left" class="w-6 h-6 text-gray-600" />
          </button>
          <button
            v-if="imageUrl"
            @click="rotateRight"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            :title="t('UI.photoeditor.tooltip.rotateRight')"
          >
            <Icon icon="mdi:rotate-right" class="w-6 h-6 text-gray-600" />
          </button>
          <button
            v-if="imageUrl"
            @click="zoomIn"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            :title="t('UI.photoeditor.tooltip.zoomIn')"
          >
            <Icon icon="mdi:magnify-plus" class="w-6 h-6 text-gray-600" />
          </button>
          <button
            v-if="imageUrl"
            @click="zoomOut"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            :title="t('UI.photoeditor.tooltip.zoomOut')"
          >
            <Icon icon="mdi:magnify-minus" class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="cancel"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {{ t('UI.buttons.cancel') }}
          </button>
          <button
            :disabled="!imageUrl"
            @click="save"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ t('UI.buttons.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  maxSize: {
    type: Number,
    default: 1024
  }
})

const emit = defineEmits(['save', 'cancel'])

const imageUrl = ref(null)
const fileInput = ref(null)
const imageRef = ref(null)
const canvasRef = ref(null)
const scale = ref(1)
const rotation = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// Оптимизация: кэшируем контекст canvas
let ctx = null

onMounted(() => {
  if (imageUrl.value) {
    drawImage()
  }
})

// Отрисовка изображения с оптимизацией
const drawImage = () => {
  if (!imageRef.value || !canvasRef.value) return

  if (!ctx) {
    ctx = canvasRef.value.getContext('2d')
  }

  const image = imageRef.value

  // Очищаем canvas
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // Сохраняем текущее состояние
  ctx.save()

  // Перемещаем в центр
  ctx.translate(canvasRef.value.width / 2, canvasRef.value.height / 2)

  // Поворачиваем
  ctx.rotate(rotation.value * Math.PI / 180)

  // Масштабируем
  ctx.scale(scale.value, scale.value)

  // Применяем смещение
  ctx.translate(offsetX.value, offsetY.value)

  // Рисуем изображение
  ctx.drawImage(
    image,
    -image.width / 2,
    -image.height / 2,
    image.width,
    image.height
  )

  // Восстанавливаем состояние
  ctx.restore()
}

// Оптимизация: используем requestAnimationFrame для плавного перетаскивания
let animationFrame = null

const startDrag = (e) => {
  if (!imageUrl.value) return
  isDragging.value = true
  lastX.value = e.clientX || e.touches[0].clientX
  lastY.value = e.clientY || e.touches[0].clientY
}

const drag = (e) => {
  if (!isDragging.value || !imageUrl.value) return
  e.preventDefault()

  const currentX = e.clientX || e.touches[0].clientX
  const currentY = e.clientY || e.touches[0].clientY

  const dx = (currentX - lastX.value) / scale.value
  const dy = (currentY - lastY.value) / scale.value

  offsetX.value += dx
  offsetY.value += dy

  lastX.value = currentX
  lastY.value = currentY

  // Используем requestAnimationFrame для оптимизации
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animationFrame = requestAnimationFrame(drawImage)
}

const stopDrag = () => {
  isDragging.value = false
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

// Центрирование изображения
const centerImage = () => {
  offsetX.value = 0
  offsetY.value = 0
  drawImage()
}

// Обработка выбора файла с оптимизацией
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Проверяем размер файла
    if (file.size > props.maxSize * 1024) {
      alert(`Размер файла не должен превышать ${props.maxSize}KB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result
      // Сбрасываем все параметры при загрузке нового изображения
      scale.value = 1
      rotation.value = 0
      offsetX.value = 0
      offsetY.value = 0
      drawImage()
    }
    reader.readAsDataURL(file)
  }
}

// Функции редактирования с оптимизацией
const rotateLeft = () => {
  rotation.value -= 90
  drawImage()
}

const rotateRight = () => {
  rotation.value += 90
  drawImage()
}

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.1, 5) // Ограничиваем максимальный масштаб
  drawImage()
}

const zoomOut = () => {
  scale.value = Math.max(scale.value * 0.9, 0.1) // Ограничиваем минимальный масштаб
  drawImage()
}

// Сохранение с оптимизацией
const save = async () => {
  if (!canvasRef.value) return

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = 851
  tempCanvas.height = 105

  const ctx = tempCanvas.getContext('2d')
  ctx.drawImage(
    canvasRef.value,
    0,
    0,
    851,
    105
  )

  // Оптимизация изображения
  const optimizeImage = async (canvas, quality = 0.8) => {
    // Создаем временный canvas для оптимизации
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')

    // Устанавливаем размеры
    tempCanvas.width = 851
    tempCanvas.height = 105

    // Рисуем изображение с новыми размерами
    tempCtx.drawImage(canvas, 0, 0, 851, 105)

    // Пробуем разные уровни качества для достижения оптимального размера
    let currentQuality = quality
    let blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/jpeg', currentQuality))

    // Если размер все еще слишком большой, уменьшаем качество
    while (blob.size > 500 * 1024 && currentQuality > 0.1) { // Максимум 500KB
      currentQuality -= 0.1
      blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/jpeg', currentQuality))
    }

    return blob
  }

  // Получаем оптимизированное изображение
  const optimizedBlob = await optimizeImage(tempCanvas)

  // Создаем File объект из Blob
  const file = new File([optimizedBlob], 'cover.jpg', { type: 'image/jpeg' })

  // Сохраняем в localStorage для предпросмотра
  const reader = new FileReader()
  reader.onload = (e) => {
    localStorage.setItem('tempCover', e.target.result)
  }
  reader.readAsDataURL(optimizedBlob)

  // Отправляем File объект
  emit('save', file)
}

const cancel = () => {
  imageUrl.value = null
  emit('cancel')
}

// Очистка при размонтировании
onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.cover-editor {
  @apply flex flex-col;
  min-height: 300px;
}

.editor-area {
  @apply flex flex-col;
  min-height: 300px;
  cursor: grab;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.editor-area:active {
  cursor: grabbing;
}

.tools-panel {
  @apply flex flex-col sm:flex-row items-center justify-between p-4;
  position: sticky;
  bottom: 0;
  z-index: 10;
  gap: 1rem;
}

canvas {
  @apply w-full h-full;
  background-color: #f3f4f6;
}

/* Мобильные стили */
@media (max-width: 640px) {
  .cover-editor {
    min-height: 200px;
  }

  .editor-area {
    min-height: 200px;
  }

  .tools-panel {
    @apply flex-col;
  }
}
</style>
