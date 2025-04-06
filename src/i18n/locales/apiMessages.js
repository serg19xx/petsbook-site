import { API_RESPONSE_CODES } from '@/constants/apiResponseCodes'

export const API_MESSAGE_KEYS = {
  // Success messages
  [API_RESPONSE_CODES.SUCCESS.LOGIN]: 'api.success.login',
  [API_RESPONSE_CODES.SUCCESS.REGISTRATION]: 'api.success.registration',
  [API_RESPONSE_CODES.SUCCESS.USER_DATA]: 'api.success.user_data',
  [API_RESPONSE_CODES.SUCCESS.PASSWORD_RESET]: 'api.success.password_reset',
  [API_RESPONSE_CODES.SUCCESS.EMAIL_VERIFICATION]: 'api.success.email_verification',
  // New user management success messages
  [API_RESPONSE_CODES.SUCCESS.USERS_LIST]: 'api.success.users_list',
  [API_RESPONSE_CODES.SUCCESS.USER_UPDATE]: 'api.success.user_update',
  [API_RESPONSE_CODES.SUCCESS.USER_DELETE]: 'api.success.user_delete',
  [API_RESPONSE_CODES.SUCCESS.USERS_SEARCH]: 'api.success.users_search',

  // Authentication error messages
  [API_RESPONSE_CODES.AUTH_ERROR.MISSING_CREDENTIALS]: 'api.auth.missing_credentials',
  [API_RESPONSE_CODES.AUTH_ERROR.INVALID_CREDENTIALS]: 'api.auth.invalid_credentials',
  [API_RESPONSE_CODES.AUTH_ERROR.LOGIN_FAILED]: 'api.auth.login_failed',
  [API_RESPONSE_CODES.AUTH_ERROR.ACCOUNT_INACTIVE]: 'api.auth.account_inactive',
  [API_RESPONSE_CODES.AUTH_ERROR.EMAIL_NOT_VERIFIED]: 'api.auth.email_not_verified',
  [API_RESPONSE_CODES.AUTH_ERROR.ACCOUNT_BLOCKED]: 'api.auth.account_blocked',
  [API_RESPONSE_CODES.AUTH_ERROR.EMAIL_ALREADY_EXISTS]: 'api.auth.email_exists',
  [API_RESPONSE_CODES.AUTH_ERROR.JWT_CONFIG_MISSING]: 'api.auth.jwt_config_missing',

  // Token error messages
  [API_RESPONSE_CODES.TOKEN_ERROR.NOT_PROVIDED]: 'api.token.not_provided',
  [API_RESPONSE_CODES.TOKEN_ERROR.INVALID]: 'api.token.invalid',
  [API_RESPONSE_CODES.TOKEN_ERROR.EXPIRED]: 'api.token.expired',

  // User error messages
  [API_RESPONSE_CODES.USER_ERROR.NOT_FOUND]: 'api.user.not_found',
  [API_RESPONSE_CODES.USER_ERROR.INVALID_ROLE]: 'api.user.invalid_role',
  [API_RESPONSE_CODES.USER_ERROR.EMAIL_EXISTS]: 'api.user.email_exists',
  [API_RESPONSE_CODES.USER_ERROR.INVALID_DATA]: 'api.user.invalid_data',

  // System error messages
  [API_RESPONSE_CODES.SYSTEM_ERROR.GENERAL]: 'api.system.general_error',
  [API_RESPONSE_CODES.SYSTEM_ERROR.DATABASE]: 'api.system.database_error',
  [API_RESPONSE_CODES.SYSTEM_ERROR.EMAIL_SEND]: 'api.system.email_send_error',
}
