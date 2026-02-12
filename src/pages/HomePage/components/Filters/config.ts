import { CourseLevel } from 'pages/HomePage/config/cards';
import type { CoursesFiltersValue, DraftState } from './types';

export type { CoursesFiltersValue, DraftState };

export const LEVELS_ORDER: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export const WEEKDAYS: { value: string; label: string }[] = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
  { value: 'sunday', label: 'Воскресенье' },
];

export const STUDIOS: string[] = [
  'ТанцХаб',
  'DanceLab',
  'Студия движения',
  'Арт-пространство',
  'Грация',
];

export const EMPTY_FILTERS: CoursesFiltersValue = {
  titles: [],
  levels: [],
};

export function uniqSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ru'));
}

export function parseNumberOrUndef(v: string): number | undefined {
  const n = Number(v);

  return Number.isFinite(n) ? n : undefined;
}

export function toDraft(value: CoursesFiltersValue): DraftState {
  return {
    titles: value.titles ?? [],
    levels: value.levels ?? [],
    teachers: value.teachers ?? [],
    studios: value.studios ?? [],
    weekdays: value.weekdays ?? [],
    dateFrom: value.dateFrom ?? '',
    dateTo: value.dateTo ?? '',
    timeFrom: value.timeFrom ?? '',
    timeTo: value.timeTo ?? '',
    priceFrom: value.priceFrom === undefined ? '' : String(value.priceFrom),
    priceTo: value.priceTo === undefined ? '' : String(value.priceTo),
  };
}

export function toApplied(draft: DraftState): CoursesFiltersValue {
  const priceFrom = draft.priceFrom.trim() ? parseNumberOrUndef(draft.priceFrom) : undefined;
  const priceTo = draft.priceTo.trim() ? parseNumberOrUndef(draft.priceTo) : undefined;

  return {
    titles: draft.titles,
    levels: draft.levels,
    teachers: draft.teachers.length > 0 ? draft.teachers : undefined,
    studios: draft.studios.length > 0 ? draft.studios : undefined,
    weekdays: draft.weekdays.length > 0 ? draft.weekdays : undefined,
    dateFrom: draft.dateFrom || undefined,
    dateTo: draft.dateTo || undefined,
    timeFrom: draft.timeFrom || undefined,
    timeTo: draft.timeTo || undefined,
    priceFrom,
    priceTo,
  };
}
