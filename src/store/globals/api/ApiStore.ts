import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { ENDPOINTS } from 'config/api';
import { SnackbarServerMessageList } from 'config/snackbars';
import { RefreshTokenResponseServer } from 'entities/auth';
import { ErrorResponse as BaseErrorResponse, LSKey } from 'store/globals/api/types';
import { ApiRequest } from 'store/models/ApiRequest';
import { ApiCallArgs, IApiRequest } from 'store/models/ApiRequest/declaration';
import { isJwtExpired } from 'utils/jwtUtils';

import { type IRootStore } from '../root/declaration';

import { IApiStore } from './declaration';

type CreateExtendedRequestOptions = ApiCallArgs & {
  errorMap?: SnackbarServerMessageList;
  showExpectedError?: boolean;
  showUnexpectedError?: boolean;
};

export default class ApiStore implements IApiStore {
  private readonly _axios: AxiosInstance;
  private readonly _refreshAxios: AxiosInstance;
  private readonly _rootStore: IRootStore;
  private _refreshPromise: Promise<string | null> | null = null;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;

    this._axios = axios.create();
    this._refreshAxios = axios.create();
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

  setAuthToken = (token: string | null): void => {
    if (token) {
      this._rootStore.storageStore.setItem(LSKey.token, token);

      return;
    }

    this._rootStore.storageStore.removeItem(LSKey.token);
  };

  setRefreshToken = (token: string | null): void => {
    if (token) {
      this._rootStore.storageStore.setItem(LSKey.refreshToken, token);

      return;
    }

    this._rootStore.storageStore.removeItem(LSKey.refreshToken);
  };

  setAuthTokens = ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string | null;
    refreshToken?: string | null;
  }): void => {
    this.setAuthToken(accessToken);

    if (refreshToken !== undefined) {
      this.setRefreshToken(refreshToken);
    }
  };

  clearAuthData = (): void => {
    this.setAuthToken(null);
    this.setRefreshToken(null);
  };

  refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = this._rootStore.storageStore.getItem(LSKey.refreshToken);

    if (!refreshToken) {
      this.clearAuthData();

      return null;
    }

    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    this._refreshPromise = this._performRefresh(refreshToken);

    return this._refreshPromise;
  };

  private readonly _addAuthorizationConfig = async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    let token = this._rootStore.storageStore.getItem(LSKey.token);

    if (!token || isJwtExpired(token)) {
      token = await this.refreshAccessToken();
    }

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

  private readonly _performRefresh = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await this._refreshAxios.post<RefreshTokenResponseServer>(
        ENDPOINTS.auth.refresh.url,
        { refresh: refreshToken }
      );

      this.setAuthTokens({
        accessToken: response.data.access,
        refreshToken: response.data.refresh ?? refreshToken,
      });

      return response.data.access;
    } catch {
      this.clearAuthData();

      return null;
    } finally {
      this._refreshPromise = null;
    }
  };
}
