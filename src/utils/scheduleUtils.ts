import type { CourseConfigItem, ScheduleEntry } from 'config/cards';

const WEEKDAY_LABELS: Record<string, string> = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс',
};

function getEntries(course: CourseConfigItem): ScheduleEntry[] {
  return course.schedule ?? [];
}

function formatWeekdayLabel(value: string): string {
  return value
    .split(',')
    .map((day) => day.trim())
    .filter(Boolean)
    .map((day) => WEEKDAY_LABELS[day] ?? day)
    .join(', ');
}

function isUniform(entries: ScheduleEntry[]): boolean {
  return entries.every((e) => e.timeFrom === entries[0].timeFrom && e.timeTo === entries[0].timeTo);
}

function timeRange(from: string, to: string): string {
  return `${from}\u00A0\u2013\u00A0${to}`;
}

/* ---- Для фильтров (FiltersStore) ---- */

export function getCourseWeekdays(course: CourseConfigItem): string[] {
  return getEntries(course).flatMap((e) => e.weekday.split(',').map((d) => d.trim()));
}

export function getCourseTimeFrom(course: CourseConfigItem): string {
  const entries = getEntries(course);

  return entries.reduce(
    (min, e) => (e.timeFrom < min ? e.timeFrom : min),
    entries[0]?.timeFrom ?? ''
  );
}

export function getCourseTimeTo(course: CourseConfigItem): string {
  const entries = getEntries(course);

  return entries.reduce((max, e) => (e.timeTo > max ? e.timeTo : max), entries[0]?.timeTo ?? '');
}

/* ---- Для карточки (Card) ---- */

export type ScheduleDisplay = { days: string; time: string; location?: string };

export function getScheduleDisplay(course: CourseConfigItem): ScheduleDisplay | null {
  const entries = getEntries(course);

  if (entries.length === 0) {
    return null;
  }

  const days = entries.map((e) => formatWeekdayLabel(e.weekday)).join(', ');

  if (isUniform(entries)) {
    const first = entries[0];

    return {
      days,
      time: timeRange(first.timeFrom, first.timeTo),
      location: first.location,
    };
  }

  return { days, time: 'разное время' };
}

/* ---- Для страницы курса (CoursePage) ---- */

export type ScheduleLineItem = { day: string; time: string; location?: string };

export function getScheduleLines(course: CourseConfigItem): ScheduleLineItem[] {
  const entries = getEntries(course);

  if (entries.length === 0) {
    return [];
  }

  if (isUniform(entries)) {
    const days = entries.map((e) => formatWeekdayLabel(e.weekday)).join(', ');
    const first = entries[0];

    return [
      {
        day: days,
        time: timeRange(first.timeFrom, first.timeTo),
        location: first.location,
      },
    ];
  }

  return entries.map((e) => ({
    day: formatWeekdayLabel(e.weekday),
    time: timeRange(e.timeFrom, e.timeTo),
    location: e.location,
  }));
}
