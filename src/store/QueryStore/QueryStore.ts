import { action, makeObservable, observable, reaction, IReactionDisposer } from 'mobx';

import type { CoursesFiltersValue } from 'pages/HomePage/components/Filters/types';
import type { CourseLevel } from 'pages/HomePage/config/cards';
import { FiltersStore } from 'store/FiltersStore';
import { PaginationStore } from 'store/PaginationStore';
import { ILocalStore } from 'store/interfaces';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type QueryParams = {
  filters: CoursesFiltersValue;
  page: number;
  search: string;
};

/* ------------------------------------------------------------------ */
/*  URL → State  (parsing)                                             */
/* ------------------------------------------------------------------ */

function parseArrayParam(params: URLSearchParams, key: string): string[] {
  const value = params.get(key);

  if (!value) {
    return [];
  }

  return value.split(',').filter(Boolean);
}

function parseNumberParam(params: URLSearchParams, key: string): number | undefined {
  const value = params.get(key);

  if (!value) {
    return undefined;
  }

  const num = Number(value);

  return Number.isFinite(num) ? num : undefined;
}

export function parseQueryFromURL(): QueryParams {
  const params = new URLSearchParams(window.location.search);

  const types = parseArrayParam(params, 'type');
  const levels = parseArrayParam(params, 'levels') as CourseLevel[];
  const teachers = parseArrayParam(params, 'teachers');
  const studios = parseArrayParam(params, 'studios');
  const weekdays = parseArrayParam(params, 'weekdays');

  return {
    filters: {
      types,
      levels,
      teachers: teachers.length ? teachers : undefined,
      studios: studios.length ? studios : undefined,
      weekdays: weekdays.length ? weekdays : undefined,
      dateFrom: params.get('dateFrom') ?? undefined,
      dateTo: params.get('dateTo') ?? undefined,
      timeFrom: params.get('timeFrom') ?? undefined,
      timeTo: params.get('timeTo') ?? undefined,
      priceFrom: parseNumberParam(params, 'priceFrom'),
      priceTo: parseNumberParam(params, 'priceTo'),
    },
    page: parseNumberParam(params, 'page') ?? 1,
    search: params.get('search') ?? '',
  };
}

/* ------------------------------------------------------------------ */
/*  State → URL  (serialization)                                       */
/* ------------------------------------------------------------------ */

function buildSearchString(filters: CoursesFiltersValue, page: number, search: string): string {
  const params = new URLSearchParams();

  if (filters.types.length) {
    params.set('type', filters.types.join(','));
  }

  if (filters.levels.length) {
    params.set('levels', filters.levels.join(','));
  }

  if (filters.teachers?.length) {
    params.set('teachers', filters.teachers.join(','));
  }

  if (filters.studios?.length) {
    params.set('studios', filters.studios.join(','));
  }

  if (filters.weekdays?.length) {
    params.set('weekdays', filters.weekdays.join(','));
  }

  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
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

  if (page > 1) {
    params.set('page', String(page));
  }

  if (search) {
    params.set('search', search);
  }

  const str = params.toString();

  return str ? `?${str}` : '';
}

/* ------------------------------------------------------------------ */
/*  QueryStore                                                         */
/* ------------------------------------------------------------------ */

export class QueryStore implements ILocalStore {
  /** Search value, synced to URL */
  private _search = '';

  private _disposers: IReactionDisposer[] = [];

  constructor(
    private _filtersStore: FiltersStore,
    private _paginationStore: PaginationStore,
    initialSearch = ''
  ) {
    this._search = initialSearch;

    makeObservable<this, '_search'>(this, {
      _search: observable,
      setSearch: action,
    });

    // React on any tracked change → update URL via replaceState
    this._disposers.push(
      reaction(
        () => ({
          filters: this._filtersStore.applied,
          page: this._paginationStore.currentPage,
          search: this._search,
        }),
        ({ filters, page, search }) => {
          const qs = buildSearchString(filters, page, search);

          window.history.replaceState(null, '', window.location.pathname + qs);
        }
      )
    );
  }

  setSearch(value: string): void {
    this._search = value;
  }

  destroy(): void {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
