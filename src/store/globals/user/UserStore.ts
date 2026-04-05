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
  };

  refreshUser = (): void => {
    void this.requestUser();
  };

  requestUser = async (): Promise<UserT | null> => {
    const response = await this._requests.user.call();

    if (response.isError) {
      this.rootStore.apiStore.clearAuthData();
      this._user.setValue(null);
      this._flags.setValue({});

      return null;
    }

    const normalizedUser = normalizeUser(response.data) as UserT;

    this._user.setValue(normalizedUser);
    this._flags.setValue(normalizedUser.flags ?? {});

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

    return Promise.resolve();
  };

  destroy = () => {};
}
