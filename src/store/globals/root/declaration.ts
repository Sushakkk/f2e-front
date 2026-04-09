import { CoursesStore } from 'store/CoursesStore';
import { IAppStateModel } from 'store/models/AppStateModel/declaration';

import { IApiStore } from '../api/declaration';
import { IAppParamsStore } from '../appParams/declaration';
import { IDanceStylesStore } from '../danceStyles/declaration';
import { IRouterStore } from '../router/declaration';
import { ISnackbarStore } from '../snackbar/declaration';
import { IStorageStore } from '../storage/declaration';
import { IUserStore } from '../user/declaration';

import { RootStoreInitProps } from './types';

export interface IRootStore {
  appState: IAppStateModel;

  appParamsStore: IAppParamsStore;

  coursesStore: CoursesStore;

  danceStylesStore: IDanceStylesStore;

  routerStore: IRouterStore;

  snackbarStore: ISnackbarStore;

  storageStore: IStorageStore;

  userStore: IUserStore;

  apiStore: IApiStore;

  reload: () => void;

  init: (initProps: RootStoreInitProps) => Promise<boolean>;

  destroy: () => void;
}
