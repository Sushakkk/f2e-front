import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { SnackbarServerMessageList } from 'config/snackbars';
import { ErrorResponse as BaseErrorResponse, LSKey } from 'store/globals/api/types';
import { ApiRequest } from 'store/models/ApiRequest';
import { ApiCallArgs, IApiRequest } from 'store/models/ApiRequest/declaration';

import { type IRootStore } from '../root/declaration';

import { IApiStore } from './declaration';

type CreateExtendedRequestOptions = ApiCallArgs & {
  errorMap?: SnackbarServerMessageList;
  showExpectedError?: boolean;
  showUnexpectedError?: boolean;
};

export default class ApiStore implements IApiStore {
  private readonly _axios: AxiosInstance;
  private readonly _rootStore: IRootStore;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;

    this._axios = axios.create();
    this._axios.interceptors.request.use(this._addAuthorizationConfig);
  }

  createExtendedRequest = <ResponseData, ErrorResponse extends BaseErrorResponse>(
    requestParams: CreateExtendedRequestOptions
  ): IApiRequest<ResponseData, ErrorResponse> => {
    const { errorMap, showExpectedError, showUnexpectedError, ...callArgs } = requestParams;

    return new ApiRequest<ResponseData, ErrorResponse>({
      axiosInstance: this._axios,
      requestParams: callArgs,
      errorMap,
      showExpectedError,
      showUnexpectedError,
      rootStore: this._rootStore,
    });
  };

  private readonly _addAuthorizationConfig = (
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig => {
    const token = this._rootStore.storageStore.getItem(LSKey.token);

    if (!token) {
      return config;
    }

    const headers = AxiosHeaders.from(config.headers);

    headers.set('Authorization', `Bearer ${token}`, true);

    return {
      ...config,
      headers,
    };
  };
}
