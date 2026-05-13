import { action, computed, makeObservable, observable, IReactionDisposer, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import { CourseConfigItem, CourseLevel } from 'config';
import type { CityServer } from 'entities/city/server';
import type { BackendTeacherListItem } from 'entities/teacher/server';
import {
  EMPTY_FILTERS,
  LEVELS_ORDER,
  WEEKDAYS,
  toDraft,
  toApplied,
  uniqSorted,
} from 'pages/HomePage/components/Filters/config';
import type { CoursesFiltersValue, DraftState } from 'pages/HomePage/components/Filters/types';
import type { ErrorResponse } from 'store/globals/api/types';
import type { IRootStore } from 'store/globals/root/declaration';
import { ILocalStore } from 'store/interfaces';
import { fromIsoDate, parseDDMM } from 'utils/dateUtils';
import { getCourseWeekdays, getCourseTimeFrom, getCourseTimeTo } from 'utils/scheduleUtils';

type StudioDictionaryItem = {
  id: number;
  name: string;
  city: string;
  address: string;
  metro: string;
};

export class FiltersStore implements ILocalStore {
  draft: DraftState;
  applied: CoursesFiltersValue;

  private readonly _rootStore: IRootStore;
  private _courses: CourseConfigItem[];
  private _onClose?: () => void;
  private _disposers: IReactionDisposer[] = [];
  private _cityOptionsData: string[] = [];
  private _teacherOptionsData: string[] = [];
  private _studioOptionsData: StudioDictionaryItem[] = [];

  constructor(
    rootStore: IRootStore,
    courses: CourseConfigItem[],
    value: CoursesFiltersValue,
    onClose?: () => void
  ) {
    this._rootStore = rootStore;
    this._courses = courses;
    this._onClose = onClose;
    this.draft = toDraft(value);
    this.applied = value;

    makeObservable<this, '_courses'>(this, {
      draft: observable,
      applied: observable.ref,
      _courses: observable.ref,
      filteredCourses: computed,
      teacherOptions: computed,
      levelOptions: computed,
      studioOptions: computed,
      cityOptions: computed,
      weekdayOptions: computed,
      loadReferenceOptions: action.bound,
      syncFromValue: action,
      setCourses: action,
      setDraft: action,
      setTypes: action,
      toggleType: action,
      setLevels: action,
      setTeachers: action,
      setStudios: action,
      setCities: action,
      setWeekdays: action,
      setDateRange: action,
      setTimeFrom: action,
      setTimeTo: action,
      setPriceFrom: action,
      setPriceTo: action,
      reset: action,
      submit: action,
    });
  }

  get filteredCourses(): CourseConfigItem[] {
    const filters = this.applied;
    const courses = this._courses;

    const types = filters.types ?? [];
    const levels = filters.levels ?? [];
    const teachers = filters.teachers ?? [];
    const studios = filters.studios ?? [];
    const cities = filters.cities ?? [];
    const weekdays = filters.weekdays ?? [];
    const priceFrom = filters.priceFrom;
    const priceTo = filters.priceTo;
    const filterTimeFrom = filters.timeFrom ?? '';
    const filterTimeTo = filters.timeTo ?? '';

    const filterDateFrom = fromIsoDate(filters.dateFrom ?? '');
    const filterDateTo = fromIsoDate(filters.dateTo ?? '');
    const hasDateFilter = filterDateFrom !== null || filterDateTo !== null;

    const referenceYear =
      filterDateFrom?.getFullYear() ?? filterDateTo?.getFullYear() ?? new Date().getFullYear();

    return courses.filter((course) => {
      if (types.length > 0 && !types.includes(course.type)) {
        return false;
      }

      if (levels.length > 0 && !levels.includes(course.level)) {
        return false;
      }

      if (teachers.length > 0 && !teachers.includes(course.teacher.name)) {
        return false;
      }

      if (studios.length > 0 && !studios.includes(course.studio)) {
        return false;
      }

      if (cities.length > 0 && !cities.includes(course.city)) {
        return false;
      }

      const courseWeekdays = getCourseWeekdays(course);

      if (weekdays.length > 0 && !weekdays.some((day) => courseWeekdays.includes(day))) {
        return false;
      }

      if (priceFrom !== undefined && course.price < priceFrom) {
        return false;
      }

      if (priceTo !== undefined && course.price > priceTo) {
        return false;
      }

      const courseTimeFrom = getCourseTimeFrom(course);
      const courseTimeTo = getCourseTimeTo(course);

      if (filterTimeFrom && courseTimeTo < filterTimeFrom) {
        return false;
      }

      if (filterTimeTo && courseTimeFrom > filterTimeTo) {
        return false;
      }

      if (hasDateFilter) {
        const courseStart = parseDDMM(course.dateFrom, referenceYear);
        const courseEnd = parseDDMM(course.dateTo, referenceYear);

        if (filterDateFrom && courseStart && courseStart < filterDateFrom) {
          return false;
        }

        if (filterDateTo && courseEnd && courseEnd > filterDateTo) {
          return false;
        }
      }

      return true;
    });
  }

  get teacherOptions(): { value: string; label: string }[] {
    const source =
      this._teacherOptionsData.length > 0
        ? this._teacherOptionsData
        : uniqSorted(this._courses.map((c) => c.teacher.name).filter(Boolean));

    return source.map((t) => ({
      value: t,
      label: t,
    }));
  }

  get levelOptions(): { value: string; label: string }[] {
    return LEVELS_ORDER.map((lvl) => ({
      value: lvl,
      label: lvl,
    }));
  }

  get studioOptions(): { value: string; label: string }[] {
    const source =
      this._studioOptionsData.length > 0
        ? this._studioOptionsData
            .filter((studio) => this.draft.cities.length === 0 || this.draft.cities.includes(studio.city))
            .map((studio) => studio.name)
        : this._courses
            .map((course) => ({ name: course.studio, city: course.city }))
            .filter((studio) => studio.name)
            .filter((studio) => this.draft.cities.length === 0 || this.draft.cities.includes(studio.city))
            .map((studio) => studio.name);

    return uniqSorted(source).map((x) => ({ value: x, label: x }));
  }

  get cityOptions(): { value: string; label: string }[] {
    const source =
      this._cityOptionsData.length > 0
        ? this._cityOptionsData
        : uniqSorted(this._courses.map((c) => c.city).filter(Boolean));

    return source.map((x) => ({ value: x, label: x }));
  }

  get weekdayOptions(): { value: string; label: string }[] {
    return WEEKDAYS;
  }

  async loadReferenceOptions(): Promise<void> {
    const [citiesResponse, studiosResponse, teachersResponse] = await Promise.all([
      this._rootStore.apiStore
        .createExtendedRequest<CityServer[], ErrorResponse>({
          ...ENDPOINTS.dictionaries.cities,
          showExpectedError: false,
          showUnexpectedError: false,
        })
        .call(),
      this._rootStore.apiStore
        .createExtendedRequest<StudioDictionaryItem[], ErrorResponse>({
          ...ENDPOINTS.dictionaries.studios,
          showExpectedError: false,
          showUnexpectedError: false,
        })
        .call(),
      this._rootStore.apiStore
        .createExtendedRequest<BackendTeacherListItem[], ErrorResponse>({
          ...ENDPOINTS.teachers.list,
          showExpectedError: false,
          showUnexpectedError: false,
        })
        .call(),
    ]);

    runInAction(() => {
      if (!citiesResponse.isError) {
        this._cityOptionsData = uniqSorted(citiesResponse.data.map((city) => city.name).filter(Boolean));
      }

      if (!studiosResponse.isError) {
        this._studioOptionsData = studiosResponse.data
          .filter((studio) => studio.name && studio.city)
          .map((studio) => ({
            id: studio.id,
            name: studio.name,
            city: studio.city,
            address: studio.address,
            metro: studio.metro,
          }));
      }

      if (!teachersResponse.isError) {
        this._teacherOptionsData = uniqSorted(
          teachersResponse.data.map((teacher) => teacher.full_name).filter(Boolean)
        );
      }
    });
  }

  setCourses(courses: CourseConfigItem[]): void {
    this._courses = courses;
  }

  syncFromValue(value: CoursesFiltersValue): void {
    this.draft = toDraft(value);
    this.applied = value;
  }

  setDraft(patch: Partial<DraftState>): void {
    this.draft = { ...this.draft, ...patch };
  }

  setTypes(types: string[]): void {
    this.draft = { ...this.draft, types };
  }

  toggleType(type: string): void {
    const next = new Set(this.draft.types);

    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }

    this.draft = { ...this.draft, types: Array.from(next) };
  }

  setLevels(levels: string[]): void {
    this.draft = {
      ...this.draft,
      levels: levels.filter((v): v is CourseLevel => LEVELS_ORDER.includes(v as CourseLevel)),
    };
  }

  setTeachers(teachers: string[]): void {
    this.draft = { ...this.draft, teachers };
  }

  setStudios(studios: string[]): void {
    this.draft = { ...this.draft, studios };
  }

  setCities(cities: string[]): void {
    this.draft = { ...this.draft, cities };
  }

  setWeekdays(weekdays: string[]): void {
    this.draft = { ...this.draft, weekdays };
  }

  setDateRange(from: string, to: string): void {
    this.draft = { ...this.draft, dateFrom: from, dateTo: to };
  }

  setTimeFrom(time: string): void {
    this.draft = { ...this.draft, timeFrom: time };
  }

  setTimeTo(time: string): void {
    this.draft = { ...this.draft, timeTo: time };
  }

  setPriceFrom(value: string): void {
    this.draft = { ...this.draft, priceFrom: value };
  }

  setPriceTo(value: string): void {
    this.draft = { ...this.draft, priceTo: value };
  }

  reset(): void {
    this.applied = EMPTY_FILTERS;
    this.draft = toDraft(EMPTY_FILTERS);
  }

  submit(): void {
    this.applied = toApplied(this.draft);
    this._onClose?.();
  }

  destroy(): void {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
