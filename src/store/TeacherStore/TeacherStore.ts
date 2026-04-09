import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import { normalizeTeacher, type BackendTeacher, type TeacherClient } from 'entities/teacher';
import type { ErrorResponse } from 'store/globals/api/types';
import type { IRootStore } from 'store/globals/root/declaration';
import type { ILocalStore } from 'store/interfaces/ILocalStore';

type PrivateFields = '_teacher' | '_isLoading' | '_loadError';

export class TeacherStore implements ILocalStore {
  private readonly _rootStore: IRootStore;

  private _teacher: TeacherClient | null = null;
  private _isLoading = false;
  private _loadError = false;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;

    makeObservable<this, PrivateFields>(this, {
      _teacher: observable.ref,
      _isLoading: observable,
      _loadError: observable,
      teacher: computed,
      isLoading: computed,
      loadError: computed,
      loadTeacher: action.bound,
      toggleFavorite: action.bound,
      destroy: action.bound,
    });
  }

  get teacher(): TeacherClient | null {
    return this._teacher;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get loadError(): boolean {
    return this._loadError;
  }

  private async _loadTeacherById(teacherId: number): Promise<BackendTeacher | null> {
    const request = this._rootStore.apiStore.createExtendedRequest<BackendTeacher, ErrorResponse>({
      ...ENDPOINTS.teachers.detail(teacherId),
    });
    const response = await request.call();

    if (response.isError) {
      return null;
    }

    return response.data;
  }

  loadTeacher = async (teacherId: number): Promise<void> => {
    if (this._isLoading) {
      return;
    }

    this._isLoading = true;
    this._loadError = false;
    const teacherData = await this._loadTeacherById(teacherId);

    runInAction(() => {
      this._isLoading = false;

      if (!teacherData) {
        this._loadError = true;
        this._teacher = null;

        return;
      }

      this._teacher = normalizeTeacher(teacherData);
    });
  };

  toggleFavorite = async (isFavorite: boolean): Promise<boolean> => {
    if (!this._teacher) {
      return false;
    }

    const request = this._rootStore.apiStore.createExtendedRequest<unknown, ErrorResponse>({
      ...ENDPOINTS.teachers.favorite(this._teacher.id, isFavorite ? 'DELETE' : 'POST'),
    });
    const response = await request.call();

    if (response.isError) {
      return false;
    }

    await this._rootStore.userStore.requestUser();

    return true;
  };

  destroy(): void {
    this._teacher = null;
  }
}
