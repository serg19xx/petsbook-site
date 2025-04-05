// Success codes
export const AUTH_SUCCESS_CODES = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS', // Успешный вход
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS', // Успешный выход
  REGISTER_SUCCESS: 'REGISTER_SUCCESS', // Успешная регистрация
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS', // Успешный сброс пароля
  EMAIL_VERIFIED: 'EMAIL_VERIFIED', // Email успешно подтвержден
}

// Error codes
export const AUTH_ERROR_CODES = {
  // Validation errors
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED', // Email не подтвержден
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', // Неверные учетные данные
  INVALID_TOKEN: 'INVALID_TOKEN', // Недействительный токен
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH', // Пароли не совпадают
  WEAK_PASSWORD: 'WEAK_PASSWORD', // Слабый пароль

  // Account status errors
  ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED', // Аккаунт заблокирован
  ACCOUNT_DELETED: 'ACCOUNT_DELETED', // Аккаунт удален
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE', // Аккаунт неактивен
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND', // Аккаунт не найден

  // Registration errors
  EMAIL_EXISTS: 'EMAIL_EXISTS', // Email уже существует
  USERNAME_EXISTS: 'USERNAME_EXISTS', // Имя пользователя занято
  REGISTRATION_FAILED: 'REGISTRATION_FAILED', // Ошибка регистрации

  // Session errors
  SESSION_EXPIRED: 'SESSION_EXPIRED', // Сессия истекла
  SESSION_INVALID: 'SESSION_INVALID', // Недействительная сессия

  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED', // Доступ запрещен
  ROLE_REQUIRED: 'ROLE_REQUIRED', // Требуется определенная роль

  // Technical errors
  SERVER_ERROR: 'SERVER_ERROR', // Ошибка сервера
  NETWORK_ERROR: 'NETWORK_ERROR', // Ошибка сети
  DATABASE_ERROR: 'DATABASE_ERROR', // Ошибка базы данных

  // Other errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR', // Неизвестная ошибка
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR', // Непредвиденная ошибка
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS', // Слишком много попыток
  MAINTENANCE_MODE: 'MAINTENANCE_MODE', // Режим обслуживания
}

// Status codes
export const AUTH_STATUS = {
  PENDING: 'PENDING', // Ожидание
  PROCESSING: 'PROCESSING', // В процессе
  COMPLETED: 'COMPLETED', // Завершено
  FAILED: 'FAILED', // Ошибка
  CANCELLED: 'CANCELLED', // Отменено
}

// Action types
export const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  RESET_PASSWORD: 'RESET_PASSWORD',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
}
