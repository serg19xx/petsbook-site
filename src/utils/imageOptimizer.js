/**
 * Оптимизирует изображение перед загрузкой
 * @param {File} file - Исходный файл изображения
 * @param {Object} options - Опции оптимизации
 * @param {number} options.maxWidth - Максимальная ширина
 * @param {number} options.maxHeight - Максимальная высота
 * @param {number} options.quality - Качество JPEG (0-1)
 * @param {number} options.maxSize - Максимальный размер файла в байтах
 * @returns {Promise<File>} - Оптимизированный файл
 */
export const optimizeImage = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSize = 5 * 1024 * 1024, // 5MB
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      // Рассчитываем новые размеры с сохранением пропорций
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Создаем canvas для изменения размера
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Конвертируем в Blob с указанным качеством
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'))
            return
          }

          // Если размер все еще слишком большой, уменьшаем качество
          if (blob.size > maxSize) {
            const newQuality = quality * (maxSize / blob.size)
            canvas.toBlob(
              (newBlob) => {
                if (!newBlob) {
                  reject(new Error('Canvas to Blob conversion failed'))
                  return
                }
                resolve(new File([newBlob], file.name, { type: 'image/jpeg' }))
              },
              'image/jpeg',
              newQuality,
            )
          } else {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          }
        },
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}

/**
 * Оптимизирует аватар
 * @param {File} file - Исходный файл
 * @returns {Promise<File>} - Оптимизированный файл
 */
export const optimizeAvatar = async (file) => {
  return optimizeImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
    maxSize: 500 * 1024, // 500KB
  })
}

/**
 * Оптимизирует фоновое фото
 * @param {File} file - Исходный файл
 * @returns {Promise<File>} - Оптимизированный файл
 */
export const optimizeCoverPhoto = async (file) => {
  return optimizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    maxSize: 1 * 1024 * 1024, // 1MB
  })
}
