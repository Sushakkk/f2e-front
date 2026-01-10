import { action, computed, makeObservable, observable } from 'mobx';

import { IAppStateModel } from './declaration';

const enum AppStateEnum {
  INITIAL,
  LOADING,
  LOADED_SUCCESSFULLY,
  LOADED_WITH_ERROR,
}

type PrivateFields = '_state' | '_setState';

export class AppStateModel implements IAppStateModel {
  private _state = AppStateEnum.INITIAL;

  constructor() {
    makeObservable<this, PrivateFields>(this, {
      _state: observable,
      _setState: action.bound,

      initial: computed,
      loading: computed,
      loadedSuccessfully: computed,
      loadedWithError: computed,
    });
  }

  get initial(): boolean {
    return this._state === AppStateEnum.INITIAL;
  }

  get loading(): boolean {
    return this._state === AppStateEnum.LOADING;
  }

  get loadedSuccessfully(): boolean {
    return this._state === AppStateEnum.LOADED_SUCCESSFULLY;
  }

  get loadedWithError(): boolean {
    return this._state === AppStateEnum.LOADED_WITH_ERROR;
  }

  private readonly _setState = (state: AppStateEnum) => {
    this._state = state;
  };

  readonly reset = (): void => {
    this._setState(AppStateEnum.INITIAL);
  };

  readonly setLoading = (): void => {
    this._setState(AppStateEnum.LOADING);
  };

  readonly setLoadedSuccessfully = (): void => {
    this._setState(AppStateEnum.LOADED_SUCCESSFULLY);
  };

  readonly setLoadedWithError = (): void => {
    this._setState(AppStateEnum.LOADED_WITH_ERROR);
  };
}
