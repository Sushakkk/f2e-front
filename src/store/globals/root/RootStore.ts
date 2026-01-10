import IMAGES from 'assets/images';
import { RoutePath } from 'config/router/paths';
import { ApiStore } from 'store/globals/api';
import { IApiStore } from 'store/globals/api/declaration';
import { AppParamsStore } from 'store/globals/appParams';
import { IAppParamsStore } from 'store/globals/appParams/declaration';
import { RouterStore } from 'store/globals/router';
import { IRouterStore } from 'store/globals/router/declaration';
import { SnackbarStore } from 'store/globals/snackbar';
import { ISnackbarStore } from 'store/globals/snackbar/declaration';
import { StorageStore } from 'store/globals/storage';
import { IStorageStore } from 'store/globals/storage/declaration';
import { UserStore } from 'store/globals/user';
import { IUserStore } from 'store/globals/user/declaration';
import { AppStateModel } from 'store/models/AppStateModel';
import { IAppStateModel } from 'store/models/AppStateModel/declaration';
import { loadImages } from 'utils/browser';
import { initStoreContext } from 'utils/initStoreContext';

import { type IRootStore } from './declaration';
import { RootStoreInitProps } from './types';

class RootStore implements IRootStore {
  private _isFirstInit = true;

  readonly appState: IAppStateModel = new AppStateModel();

  readonly appParamsStore: IAppParamsStore = new AppParamsStore();

  readonly routerStore: IRouterStore = new RouterStore(this);

  readonly snackbarStore: ISnackbarStore = new SnackbarStore();

  readonly apiStore: IApiStore = new ApiStore(this);

  readonly userStore: IUserStore = new UserStore(this);

  readonly storageStore: IStorageStore = new StorageStore();

  readonly reload = () => {
    this.appState.reset();
  };

  readonly init = async (initProps: RootStoreInitProps): Promise<boolean> => {
    if (!this.appState.initial) {
      return true;
    }

    this.appState.setLoading();

    const results = await Promise.all(this._getInitTasks(initProps));

    const success = results.every((ok) => ok);

    if (success) {
      this.appState.setLoadedSuccessfully();
      // this.routerStore.replace(RoutePath.onboarding);
    } else {
      this.appState.setLoadedWithError();
      this.routerStore.replace(RoutePath.error);
    }

    return success;
  };

  private readonly _getInitTasks = (initProps: RootStoreInitProps): Promise<boolean>[] => {
    const tasks: Promise<boolean>[] = [];

    if (this._isFirstInit) {
      tasks.push(this._firstInit());
      this._isFirstInit = false;
    }

    tasks.push(this.routerStore.init(initProps.navigate));

    // TODO: remove mock app loading delay
    tasks.push(new Promise((resolve) => setTimeout(resolve, 1000, true)));

    return tasks;
  };

  private readonly _firstInit = async (): Promise<boolean> => {
    await loadImages(IMAGES);

    return true;
  };

  readonly destroy = (): void => {
    this.routerStore.destroy();
  };
}

export const {
  store: rootStore,
  StoreContext: RootStoreContext,
  StoreProvider: RootStoreProvider,
  useStoreContext: useRootStore,
} = initStoreContext(() => new RootStore(), 'rootStore');
