import { action, computed, makeObservable } from 'mobx';

import { ENDPOINTS } from 'config/api';
import { BackendUser } from 'entities/user';
import { LSKey } from 'store/globals/api/types';
import { type IRootStore } from 'store/globals/root/declaration';
import { IApiRequest } from 'store/models/ApiRequest/declaration';
import { ValueModel } from 'store/models/ValueModel';

import { IUserStore } from './declaration';
import { normalizeUser, UserClient, UserFlags } from './types';

export class UserStore<UserT extends UserClient = UserClient> implements IUserStore<UserT> {
  private _user: ValueModel<null | UserT> = new ValueModel<null | UserT>(null);
  private _flags: ValueModel<UserFlags> = new ValueModel<UserFlags>({});
  private readonly _requests: {
    user: IApiRequest<BackendUser>;
    logout: IApiRequest<{ detail: string }>;
  };

  constructor(readonly rootStore: IRootStore) {
    this._requests = {
      user: this.rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.auth.user,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      logout: this.rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.auth.logout,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
    };

    makeObservable(this, {
      user: computed,
      flags: computed,

      login: action,
      logout: action,
      refreshUser: action,
      requestUser: action,
      setFavoriteCourseOptimistic: action,
      setFavoriteTeacherOptimistic: action,
      flag: action,
    });
  }

  readonly init = async (): Promise<boolean> => {
    const accessToken = this.rootStore.storageStore.getItem(LSKey.token);
    const refreshToken = this.rootStore.storageStore.getItem(LSKey.refreshToken);

    if (!accessToken && !refreshToken) {
      return true;
    }

    await this.requestUser();

    return true;
  };

  get user(): null | UserT {
    return this._user.value;
  }

  get flags(): UserFlags {
    return this._flags.value;
  }

  login = (user: UserT): void => {
    this._user.setValue(user);
    this._flags.setValue(user.flags ?? {});
    this.rootStore.coursesStore.clear();
    void this.rootStore.coursesStore.loadCourses();
    void this.rootStore.notificationsStore.load();
  };

  logout = (): void => {
    const refreshToken = this.rootStore.storageStore.getItem(LSKey.refreshToken);

    if (refreshToken) {
      void this._requests.logout.call({
        data: {
          refresh: refreshToken,
        },
      });
    }

    this.rootStore.apiStore.clearAuthData();
    this._user.setValue(null);
    this._flags.setValue({});
    this.rootStore.notificationsStore.clear();
    this.rootStore.coursesStore.clear();
    void this.rootStore.coursesStore.loadCourses();
  };

  refreshUser = (): void => {
    void this.requestUser();
  };

  setFavoriteCourseOptimistic = (courseId: number, isFavorite: boolean): void => {
    const user = this._user.value;

    if (!user) {
      return;
    }

    const currentIds = user.favoriteCourseIds ?? [];
    const favoriteCourseIds = isFavorite
      ? Array.from(new Set([...currentIds, courseId]))
      : currentIds.filter((id) => id !== courseId);

    this._user.setValue({
      ...user,
      favoriteCourseIds,
    });
  };

  setFavoriteTeacherOptimistic = (
    teacherId: number,
    teacherName: string,
    isFavorite: boolean
  ): void => {
    const user = this._user.value;

    if (!user) {
      return;
    }

    const currentIds = user.favoriteTeacherIds ?? [];
    const currentNames = user.favoriteTeacherNames ?? [];
    const pairs = currentIds.map((id, idx) => ({
      id,
      name: currentNames[idx] ?? '',
    }));

    if (isFavorite) {
      if (pairs.some((pair) => pair.id === teacherId)) {
        return;
      }

      this._user.setValue({
        ...user,
        favoriteTeacherIds: [...currentIds, teacherId],
        favoriteTeacherNames: [...currentNames, teacherName],
      });

      return;
    }

    const filtered = pairs.filter((pair) => pair.id !== teacherId);

    this._user.setValue({
      ...user,
      favoriteTeacherIds: filtered.map((pair) => pair.id),
      favoriteTeacherNames: filtered.map((pair) => pair.name),
    });
  };

  requestUser = async (): Promise<UserT | null> => {
    const response = await this._requests.user.call();

    if (response.isError) {
      this.rootStore.apiStore.clearAuthData();
      this._user.setValue(null);
      this._flags.setValue({});
      this.rootStore.notificationsStore.clear();
      this.rootStore.coursesStore.clear();
      void this.rootStore.coursesStore.loadCourses();

      return null;
    }

    const normalizedUser = normalizeUser(response.data) as UserT;

    this._user.setValue(normalizedUser);
    this._flags.setValue(normalizedUser.flags ?? {});
    void this.rootStore.notificationsStore.load();

    return normalizedUser;
  };

  flag = (name: string, value: boolean): Promise<void> => {
    this._flags.setValue({ ...this._flags.value, [name]: value });

    return Promise.resolve();
  };

  restart = (): Promise<void> => {
    this.rootStore.apiStore.clearAuthData();
    this._user.setValue(null);
    this._flags.setValue({});
    this.rootStore.notificationsStore.clear();

    return Promise.resolve();
  };

  destroy = () => {};
}
