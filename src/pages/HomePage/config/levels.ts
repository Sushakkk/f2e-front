export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  Beginner: 'Начинающие',
  Intermediate: 'Средний уровень',
  Advanced: 'Продвинутые',
};

export function formatCourseLevel(level: CourseLevel) {
  return COURSE_LEVEL_LABELS[level];
}

export const COURSE_LEVEL_OPTIONS = COURSE_LEVELS.map((lvl) => ({
  value: lvl,
  label: COURSE_LEVEL_LABELS[lvl],
}));

