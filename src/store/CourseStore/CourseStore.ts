import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import type { CourseConfigItem } from 'config/cards';
import { normalizeCourseDetail } from 'entities/course';
import type { CourseDetailResponseServer } from 'entities/course';
import type { ErrorResponse } from 'store/globals/api/types';
import type { IRootStore } from 'store/globals/root/declaration';
import type { ILocalStore } from 'store/interfaces/ILocalStore';

type PrivateFields = '_course' | '_isLoading' | '_loadError';

export class CourseStore implements ILocalStore {
  private readonly _rootStore: IRootStore;

  private _course: CourseConfigItem | null = null;
  private _isLoading = false;
  private _loadError = false;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;

    makeObservable<this, PrivateFields>(this, {
      _course: observable.ref,
      _isLoading: observable,
      _loadError: observable,
      course: computed,
      isLoading: computed,
      loadError: computed,
      loadCourse: action.bound,
      destroy: action.bound,
    });
  }

  get course(): CourseConfigItem | null {
    return this._course;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get loadError(): boolean {
    return this._loadError;
  }

  loadCourse = async (courseId: number): Promise<void> => {
    if (this._isLoading) {
      return;
    }

    this._isLoading = true;
    this._loadError = false;

    const request = this._rootStore.apiStore.createExtendedRequest<
      CourseDetailResponseServer,
      ErrorResponse
    >({
      ...ENDPOINTS.courses.detail(courseId),
    });
    const response = await request.call();

    runInAction(() => {
      this._isLoading = false;

      if (response.isError) {
        this._loadError = true;
        this._course = null;

        return;
      }

      this._course = normalizeCourseDetail(response.data);
    });
  };

  destroy(): void {
    this._course = null;
  }
}
