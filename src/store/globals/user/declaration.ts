import { IGlobalStore } from 'store/interfaces';

import { UserFlags, UserServer } from './types';

export interface IUserStore<UserT extends UserServer = UserServer> extends IGlobalStore {
  user: null | UserT;
  flags: UserFlags;

  requestUser: () => Promise<UserT | null>;
  flag: (name: string, value: boolean) => Promise<void>;
  restart: () => Promise<void>;
}
