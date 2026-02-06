import type { DayOfWeek, DanceLevel, FiltersState } from './types';

export const BREAKPOINTS = {
  md: 980,
  sm: 680,
};

export const DANCE_TYPES: string[] = [
  'High heels',
  'Push Up',
  'Knee Push Up',
  'Бальные танцы',
  'Хип-хоп',
  'Латина',
];

export const LEVELS: { key: DanceLevel; label: string }[] = [
  { key: 'beginner', label: 'Начинающие' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Продвинутые' },
  { key: 'pro', label: 'Профессионалы' },
];

export const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'any', label: 'Любой день недели' },
  { key: 'mon', label: 'Пн' },
  { key: 'tue', label: 'Вт' },
  { key: 'wed', label: 'Ср' },
  { key: 'thu', label: 'Чт' },
  { key: 'fri', label: 'Пт' },
  { key: 'sat', label: 'Сб' },
  { key: 'sun', label: 'Вс' },
];

export const DEFAULT_FILTERS: FiltersState = {
  danceTypes: [],
  level: 'any',
  date: undefined,
  time: undefined,
  day: 'any',
  teacherQuery: '',
  studioQuery: '',
  priceFrom: undefined,
  priceTo: undefined,
};
