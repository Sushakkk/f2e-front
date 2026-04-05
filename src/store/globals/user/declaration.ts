import { IGlobalStore } from 'store/interfaces';

import { UserClient, UserFlags } from './types';

export interface IUserStore<UserT extends UserClient = UserClient> extends IGlobalStore {
  user: null | UserT;
  flags: UserFlags;

  login: (user: UserT) => void;
  logout: () => void;
  refreshUser: () => void;
  requestUser: () => Promise<UserT | null>;
  flag: (name: string, value: boolean) => Promise<void>;
  restart: () => Promise<void>;
}
