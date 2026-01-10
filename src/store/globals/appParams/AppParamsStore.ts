import { makeObservable, observable } from 'mobx';

import { API_URL } from 'config/api/apiUrl';
import { checkMobile } from 'utils/browser';

import { IAppParamsStore } from './declaration';

export class AppParamsStore implements IAppParamsStore {
  readonly API_URL = API_URL;
  readonly IS_DEV = Boolean(import.meta.env.DEV);
  readonly IS_PROD = Boolean(import.meta.env.PROD);

  get apiUrl() {
    return this.API_URL;
  }

  get isDev() {
    return this.IS_DEV;
  }

  get isProd() {
    return this.IS_PROD;
  }

  isMobile: boolean;

  constructor() {
    this.isMobile = checkMobile();

    makeObservable<this>(this, {
      isMobile: observable,
    });
  }
}
