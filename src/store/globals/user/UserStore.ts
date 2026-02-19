import { action, computed, makeObservable } from 'mobx';

import { MockDb } from 'services/mockDb';
import { type IRootStore } from 'store/globals/root/declaration';
import { ValueModel } from 'store/models/ValueModel';

import { IUserStore } from './declaration';
import { UserFlags, UserServer } from './types';

export class UserStore<UserT extends UserServer = UserServer> implements IUserStore<UserT> {
  private _user: ValueModel<null | UserT> = new ValueModel<null | UserT>(null);
  private _flags: ValueModel<UserFlags> = new ValueModel<UserFlags>({});

  constructor(readonly rootStore: IRootStore) {
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

  readonly init = (): Promise<boolean> => {
    const currentUser = MockDb.getCurrentUser();

    if (currentUser) {
      this._user.setValue(currentUser as unknown as UserT);
    }

    return Promise.resolve(true);
  };

  get user(): null | UserT {
    return this._user.value;
  }

  get flags(): UserFlags {
    return this._flags.value;
  }

  login = (user: UserT): void => {
    this._user.setValue(user);
  };

  logout = (): void => {
    MockDb.logout();
    this._user.setValue(null);
  };

  refreshUser = (): void => {
    const currentUser = MockDb.getCurrentUser();

    if (currentUser) {
      this._user.setValue(currentUser as unknown as UserT);
    }
  };

  requestUser = (): Promise<UserT | null> => {
    const currentUser = MockDb.getCurrentUser();

    if (currentUser) {
      this._user.setValue(currentUser as unknown as UserT);

      return Promise.resolve(currentUser as unknown as UserT);
    }

    return Promise.resolve(null);
  };

  flag = (name: string, value: boolean): Promise<void> => {
    this._flags.setValue({ ...this._flags.value, [name]: value });

    return Promise.resolve();
  };

  restart = (): Promise<void> => {
    MockDb.reset();
    this._user.setValue(null);
    this._flags.setValue({});

    return Promise.resolve();
  };

  destroy = () => {};
}
