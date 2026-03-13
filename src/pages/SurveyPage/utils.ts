import type { CoursesFiltersValue } from 'pages/HomePage/components/Filters/types';

export function buildHomeUrlWithFilters(filters: CoursesFiltersValue): string {
  const params = new URLSearchParams();

  if (filters.types?.length) {
    params.set('type', filters.types.join(','));
  }

  if (filters.levels?.length) {
    params.set('levels', filters.levels.join(','));
  }

  if (filters.cities?.length) {
    params.set('cities', filters.cities.join(','));
  }

  if (filters.weekdays?.length) {
    params.set('weekdays', filters.weekdays.join(','));
  }

  if (filters.timeFrom) {
    params.set('timeFrom', filters.timeFrom);
  }

  if (filters.timeTo) {
    params.set('timeTo', filters.timeTo);
  }

  if (filters.priceFrom !== undefined) {
    params.set('priceFrom', String(filters.priceFrom));
  }

  if (filters.priceTo !== undefined) {
    params.set('priceTo', String(filters.priceTo));
  }

  const qs = params.toString();

  return qs ? `/home?${qs}` : '/home';
}
