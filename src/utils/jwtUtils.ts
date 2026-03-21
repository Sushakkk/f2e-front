/**
 * Проверяет, истёк ли JWT (по полю exp в payload).
 * Не верифицирует подпись — только декодирует для проверки срока.
 *
 * @param token строка JWT
 * @param bufferSeconds запас до истечения в секундах (по умолчанию 60)
 * @returns true, если токен просрочен или невалиден
 */
export function isJwtExpired(token: string, bufferSeconds = 60): boolean {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return true;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(base64 + padding);

    const data = JSON.parse(json) as { exp?: number };

    if (typeof data.exp !== 'number') {
      return false; // нет exp — считаем валидным
    }

    return Date.now() / 1000 >= data.exp - bufferSeconds;
  } catch {
    return true;
  }
}
