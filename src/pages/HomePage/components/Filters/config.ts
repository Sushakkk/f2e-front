import { CITIES, LEVELS_ORDER, STUDIOS, WEEKDAYS } from 'pages/HomePage/config/constants';

import type { CoursesFiltersValue, DraftState } from './types';

export type { CoursesFiltersValue, DraftState };

export { CITIES, LEVELS_ORDER, STUDIOS, WEEKDAYS };

export const EMPTY_FILTERS: CoursesFiltersValue = {
  types: [],
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
    types: value.types ?? [],
    levels: value.levels ?? [],
    teachers: value.teachers ?? [],
    studios: value.studios ?? [],
    cities: value.cities ?? [],
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
    types: draft.types,
    levels: draft.levels,
    teachers: draft.teachers.length > 0 ? draft.teachers : undefined,
    studios: draft.studios.length > 0 ? draft.studios : undefined,
    cities: draft.cities.length > 0 ? draft.cities : undefined,
    weekdays: draft.weekdays.length > 0 ? draft.weekdays : undefined,
    dateFrom: draft.dateFrom || undefined,
    dateTo: draft.dateTo || undefined,
    timeFrom: draft.timeFrom || undefined,
    timeTo: draft.timeTo || undefined,
    priceFrom,
    priceTo,
  };
}
