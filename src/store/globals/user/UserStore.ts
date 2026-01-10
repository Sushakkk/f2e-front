import { action, computed, makeObservable } from 'mobx';

import { ENDPOINTS } from 'config/api';
import { LSKey } from 'store/globals/api/types';
import { type IRootStore } from 'store/globals/root/declaration';
import { IApiRequest } from 'store/models/ApiRequest/declaration';
import { ValueModel } from 'store/models/ValueModel';

import { IUserStore } from './declaration';
import { ApiAuth, UserFlags, UserServer } from './types';

export class UserStore<UserT extends UserServer = UserServer> implements IUserStore<UserT> {
  private readonly _rootStore: IRootStore;

  private readonly _requests: {
    auth: IApiRequest<ApiAuth>;
    restart: IApiRequest<null>;
    getUser: IApiRequest<UserT>;
    flag: IApiRequest<UserFlags>;
  };

  private _user: ValueModel<null | UserT> = new ValueModel<null | UserT>(null);
  private _flags: ValueModel<UserFlags> = new ValueModel<UserFlags>({});

  constructor(readonly rootStore: IRootStore) {
    this._rootStore = rootStore;
    this._requests = {
      auth: this._rootStore.apiStore.createExtendedRequest({ ...ENDPOINTS.auth }),
      restart: this._rootStore.apiStore.createExtendedRequest({ ...ENDPOINTS.restart }),
      getUser: this._rootStore.apiStore.createExtendedRequest({ ...ENDPOINTS.getUser }),
      flag: this._rootStore.apiStore.createExtendedRequest({ ...ENDPOINTS.flag }),
    };

    makeObservable(this, {
      user: computed,
      flags: computed,

      requestUser: action,
      flag: action,
    });
  }

  readonly init = async (): Promise<boolean> => {
    const response = await this._requests.auth.call();

    if (response.isError) {
      return false;
    }

    if (response.data.token) {
      this._rootStore.storageStore.setItem(LSKey.token, response.data.token);
    }

    return true;
  };

  get user(): null | UserT {
    return this._user.value;
  }

  get flags(): UserFlags {
    return this._flags.value;
  }

  requestUser = async (): Promise<UserT | null> => {
    if (this._requests.getUser.isLoading) {
      return null;
    }

    const response = await this._requests.getUser.call();

    if (response.isError) {
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();

      return null;
    }

    this._user.setValue(response.data);

    return response.data;
  };

  flag = async (name: string, value: boolean): Promise<void> => {
    if (this._requests.flag.isLoading) {
      return;
    }

    const response = await this._requests.flag.call({ data: { name, value } });

    if (response.isError) {
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();
    } else {
      this._flags.setValue({ ...this._flags.value, [name]: value });
    }
  };

  restart = async (): Promise<void> => {
    if (this._requests.restart.isLoading) {
      return;
    }

    const response = await this._requests.restart.call();

    if (response.isError) {
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();
    }
  };

  destroy = () => {
    this._requests.auth.destroy();
    this._requests.restart.destroy();
    this._requests.getUser.destroy();
    this._requests.flag.destroy();
  };
}
