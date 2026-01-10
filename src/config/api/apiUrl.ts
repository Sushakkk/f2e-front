const getApiUrl = (): string => {
  /**
   * Проверяем, указано ли значение шаблонной переменной
   * (строка с начальным значением тут не заменится,
   * поскольку она заменяется только в index.html)
   */
  if (
    window.API_URL_FROM_TEMPLATE &&
    window.API_URL_FROM_TEMPLATE !== '__BACKEND_API_URL_TEMPLATE__'
  ) {
    return window.API_URL_FROM_TEMPLATE;
  }

  /**
   * Далее проверяем, передана ли переменная API_URL
   */
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  /**
   * Если ничего не указано, просто пытаемся сходить на /api,
   * плюс при разработке ходим сюда же,
   * т.к. в dev-сервере настроено проксирование
   */
  return '/api/';
};

export const API_URL = getApiUrl();
