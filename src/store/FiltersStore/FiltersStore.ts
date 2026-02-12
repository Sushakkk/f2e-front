import { action, computed, makeObservable, observable, IReactionDisposer } from 'mobx';

import {
  EMPTY_FILTERS,
  LEVELS_ORDER,
  STUDIOS,
  WEEKDAYS,
  toDraft,
  toApplied,
  uniqSorted,
} from 'pages/HomePage/components/Filters/config';
import type { CoursesFiltersValue, DraftState } from 'pages/HomePage/components/Filters/types';
import { CourseConfigItem, CourseLevel } from 'pages/HomePage/config/cards';
import { COURSE_LEVEL_LABELS } from 'pages/HomePage/config/levels';
import { ILocalStore } from 'store/interfaces';
import { fromIsoDate, parseDDMM, rangesOverlap } from 'utils/dateUtils';

export class FiltersStore implements ILocalStore {
  draft: DraftState;
  applied: CoursesFiltersValue;

  private _courses: CourseConfigItem[];
  private _onClose?: () => void;
  private _disposers: IReactionDisposer[] = [];

  constructor(courses: CourseConfigItem[], value: CoursesFiltersValue, onClose?: () => void) {
    this._courses = courses;
    this._onClose = onClose;
    this.draft = toDraft(value);
    this.applied = value;

    makeObservable<this, '_courses'>(this, {
      draft: observable,
      applied: observable.ref,
      _courses: observable.ref,
      filteredCourses: computed,
      titleOptions: computed,
      teacherOptions: computed,
      levelOptions: computed,
      studioOptions: computed,
      weekdayOptions: computed,
      syncFromValue: action,
      setDraft: action,
      toggleTitle: action,
      setLevels: action,
      setTeachers: action,
      setStudios: action,
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

    const titles = filters.titles ?? [];
    const levels = filters.levels ?? [];
    const teachers = filters.teachers ?? [];
    const priceFrom = filters.priceFrom;
    const priceTo = filters.priceTo;

    const filterDateFrom = fromIsoDate(filters.dateFrom ?? '');
    const filterDateTo = fromIsoDate(filters.dateTo ?? '');
    const hasDateFilter = filterDateFrom !== null || filterDateTo !== null;

    const referenceYear =
      filterDateFrom?.getFullYear() ?? filterDateTo?.getFullYear() ?? new Date().getFullYear();

    return courses.filter((course) => {
      if (titles.length > 0 && !titles.includes(course.title)) {
        return false;
      }

      if (levels.length > 0 && !levels.includes(course.level)) {
        return false;
      }

      if (teachers.length > 0 && !teachers.includes(course.teacher)) {
        return false;
      }

      if (priceFrom !== undefined && course.price < priceFrom) {
        return false;
      }

      if (priceTo !== undefined && course.price > priceTo) {
        return false;
      }

      if (hasDateFilter) {
        const courseStart = parseDDMM(course.dateFrom, referenceYear);
        const courseEnd = parseDDMM(course.dateTo, referenceYear);

        if (!rangesOverlap(courseStart, courseEnd, filterDateFrom, filterDateTo)) {
          return false;
        }
      }

      return true;
    });
  }

  get titleOptions(): string[] {
    return uniqSorted(this._courses.map((c) => c.title).filter(Boolean));
  }

  get teacherOptions(): { value: string; label: string }[] {
    return uniqSorted(this._courses.map((c) => c.teacher).filter(Boolean)).map((t) => ({
      value: t,
      label: t,
    }));
  }

  get levelOptions(): { value: string; label: string }[] {
    const set = new Set<CourseLevel>();

    this._courses.forEach((c) => set.add(c.level));

    return LEVELS_ORDER.filter((x) => set.has(x)).map((lvl) => ({
      value: lvl,
      label: COURSE_LEVEL_LABELS[lvl],
    }));
  }

  get studioOptions(): { value: string; label: string }[] {
    return STUDIOS.map((x) => ({ value: x, label: x }));
  }

  get weekdayOptions(): { value: string; label: string }[] {
    return WEEKDAYS;
  }

  syncFromValue(value: CoursesFiltersValue): void {
    this.draft = toDraft(value);
    this.applied = value;
  }

  setDraft(patch: Partial<DraftState>): void {
    this.draft = { ...this.draft, ...patch };
  }

  toggleTitle(title: string): void {
    const next = new Set(this.draft.titles);

    if (next.has(title)) {
      next.delete(title);
    } else {
      next.add(title);
    }

    this.draft = { ...this.draft, titles: Array.from(next) };
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
