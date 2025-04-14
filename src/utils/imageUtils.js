/**
 * Оптимизирует изображение аватара
 * @param {File} file - Исходный файл изображения
 * @returns {Promise<File>} - Оптимизированный файл
 */
export const optimizeAvatar = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Устанавливаем размеры для аватара
        const size = 200
        canvas.width = size
        canvas.height = size

        // Рисуем изображение в центре
        ctx.drawImage(img, 0, 0, size, size)

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(optimizedFile)
          },
          'image/jpeg',
          0.8,
        )
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Оптимизирует изображение обложки
 * @param {File} file - Исходный файл изображения
 * @returns {Promise<File>} - Оптимизированный файл
 */
export const optimizeCoverPhoto = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Устанавливаем размеры для обложки
        const maxWidth = 1200
        const maxHeight = 400
        let width = img.width
        let height = img.height

        // Масштабируем изображение
        if (width > maxWidth) {
          height = (maxWidth * height) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (maxHeight * width) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height)

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(optimizedFile)
          },
          'image/jpeg',
          0.8,
        )
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
