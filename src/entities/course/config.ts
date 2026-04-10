/** Константы формы курса (уровни, дни недели, опорный год, мок id преподавателя для UI). */

export const PROFILE_PAGE_MOCK_TEACHER_ID = 11;

export const PROFILE_PAGE_REFERENCE_YEAR = new Date().getFullYear();

export const LEVEL_TO_API: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'any'> = {
  Начинающие: 'beginner',
  'Средний уровень': 'intermediate',
  Продвинутые: 'advanced',
  'Любой уровень': 'any',
};

export const LEVEL_FROM_API = {
  beginner: 'Начинающие',
  intermediate: 'Средний уровень',
  advanced: 'Продвинутые',
  any: 'Любой уровень',
} as const;

export const WEEKDAY_TO_API: Record<string, 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'> = {
  Пн: 'mon',
  Вт: 'tue',
  Ср: 'wed',
  Чт: 'thu',
  Пт: 'fri',
  Сб: 'sat',
  Вс: 'sun',
};
