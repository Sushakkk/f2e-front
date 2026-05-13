import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import type { CourseConfigItem } from 'config/cards';
import { normalizeCourseListItem } from 'entities/courses';
import type { CourseListResponseServer } from 'entities/courses';
import type { ErrorResponse } from 'store/globals/api/types';
import type { IRootStore } from 'store/globals/root/declaration';
import type { ILocalStore } from 'store/interfaces/ILocalStore';

type PrivateFields = '_courses' | '_isLoading' | '_loadError';

export class CoursesStore implements ILocalStore {
  private readonly _rootStore: IRootStore;

  private _courses: CourseConfigItem[] = [];
  private _isLoading = false;
  private _loadError = false;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;

    makeObservable<this, PrivateFields>(this, {
      _courses: observable.ref,
      _isLoading: observable,
      _loadError: observable,
      courses: computed,
      isLoading: computed,
      loadError: computed,
      loadCourses: action.bound,
      clear: action.bound,
      destroy: action.bound,
    });
  }

  get courses(): CourseConfigItem[] {
    return this._courses;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get loadError(): boolean {
    return this._loadError;
  }

  clear(): void {
    this._courses = [];
    this._isLoading = false;
    this._loadError = false;
  }

  loadCourses = async (): Promise<void> => {
    if (this._isLoading) {
      return;
    }

    this._isLoading = true;
    this._loadError = false;

    const request = this._rootStore.apiStore.createExtendedRequest<
      CourseListResponseServer,
      ErrorResponse
    >({
      ...ENDPOINTS.courses.list,
    });
    const response = await request.call();

    runInAction(() => {
      this._isLoading = false;

      if (response.isError) {
        this._loadError = true;
        this._courses = [];

        return;
      }

      const raw = response.data;
      const items = Array.isArray(raw) ? raw : raw.results ?? [];

      this._courses = items.map(normalizeCourseListItem);
    });
  };

  destroy(): void {
    this.clear();
  }
}
