export const COURSE_LEVELS = ['Начинающие', 'Средний уровень', 'Продвинутые', 'Любой уровень'] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_LEVEL_OPTIONS = COURSE_LEVELS.map((lvl) => ({
  value: lvl,
  label: lvl,
}));
