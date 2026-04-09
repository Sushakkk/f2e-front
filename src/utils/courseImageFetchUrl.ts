/**
 * Приводит URL превью к адресу, с которого браузер может сделать fetch с текущего origin
 * (в dev Vite проксирует /media на бэкенд — иначе fetch на порт API даёт CORS и multipart не собирается).
 */
export function resolveCourseImageFetchUrl(preview: string): string {
  if (preview.startsWith('blob:')) {
    return preview;
  }

  if (typeof window === 'undefined') {
    return preview;
  }

  if (preview.startsWith('/')) {
    return `${window.location.origin}${preview}`;
  }

  let parsed: URL;

  try {
    parsed = new URL(preview);
  } catch {
    return preview;
  }

  if (parsed.origin === window.location.origin) {
    return parsed.href;
  }

  if (parsed.pathname.startsWith('/media')) {
    return `${window.location.origin}${parsed.pathname}${parsed.search}`;
  }

  return parsed.href;
}
