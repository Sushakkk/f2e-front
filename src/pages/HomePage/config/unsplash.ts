export const UNSPLASH_HOST_PREFIX = 'https://images.unsplash.com/';

export const UNSPLASH_DEFAULT_QUERY = 'auto=format&fit=crop&w=1600&q=80';

export const withUnsplashParams = (url: string, query = UNSPLASH_DEFAULT_QUERY) => {
  // Unsplash CDN может не отдавать картинку корректно без query-параметров
  // (а с ними — стабильно и с нормальным размером).
  if (!url.startsWith(UNSPLASH_HOST_PREFIX)) {
    return url;
  }

  // Если параметры уже есть — не трогаем.
  if (url.includes('?')) {
    return url;
  }

  return `${url}?${query}`;
};
