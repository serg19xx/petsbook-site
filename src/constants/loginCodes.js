// Login specific codes
export const LOGIN_CODES = {
  // Success
  LOGIN_SUCCESS: 'LOGIN_SUCCESS', // Успешный вход

  // Validation errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', // Неверные учетные данные (email/пароль)
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED', // Email не подтвержден
  EMPTY_CREDENTIALS: 'EMPTY_CREDENTIALS', // Пустые поля email/пароль

  // Account status
  ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED', // Аккаунт заблокирован
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE', // Аккаунт неактивен
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND', // Аккаунт не найден

  // Rate limiting
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS', // Превышено количество попыток входа

  // 2FA
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED', // Требуется двухфакторная аутентификация
  INVALID_2FA_CODE: 'INVALID_2FA_CODE', // Неверный код 2FA

  // Technical
  SERVER_ERROR: 'SERVER_ERROR', // Ошибка сервера
  MAINTENANCE_MODE: 'MAINTENANCE_MODE', // Сервер на техобслуживании
}
