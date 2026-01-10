import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { SnackbarServerMessageList } from 'config/snackbars';
import { ApiResponse, ErrorResponse as BaseErrorResponse } from 'store/globals/api/types';
import { type IRootStore } from 'store/globals/root/declaration';

import { ApiCallArgs, IApiRequest } from './declaration';

type ApiRequestOptions = {
  axiosInstance: AxiosInstance;
  requestParams: ApiCallArgs;
  errorMap?: SnackbarServerMessageList;
  showExpectedError?: boolean;
  showUnexpectedError?: boolean;
  rootStore: IRootStore;
};

export default class ApiRequest<
  ResponseData,
  ErrorResponse extends BaseErrorResponse = BaseErrorResponse,
  // eslint-disable-next-line prettier/prettier
> implements IApiRequest<ResponseData, ErrorResponse> {
  private readonly _axiosInstance: AxiosInstance;
  private readonly _requestParams: ApiCallArgs;
  private readonly _errorResponseMap: SnackbarServerMessageList | null;
  private readonly _showExpectedError: boolean;
  private readonly _showUnexpectedError: boolean;
  private readonly _rootStore: IRootStore;
  private readonly _requestUrl: string;

  private _abortController: AbortController | null = null;
  private _isLoading = false;
  private _isSuccess = false;
  private _isFailed = false;
  private _isLoaded = false;

  constructor({
    axiosInstance,
    requestParams,
    errorMap,
    showExpectedError,
    showUnexpectedError,
    rootStore,
  }: ApiRequestOptions) {
    this._axiosInstance = axiosInstance;
    this._requestParams = requestParams;
    this._errorResponseMap = errorMap ?? null;
    this._showExpectedError = showExpectedError ?? true;
    this._showUnexpectedError = showUnexpectedError ?? true;
    this._rootStore = rootStore;
    this._requestUrl = requestParams.url;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailed(): boolean {
    return this._isFailed;
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  call = async <
    T extends ResponseData,
    E extends ErrorResponse,
    R extends Record<string, unknown> | FormData = Record<string, unknown>,
  >(
    params?: Partial<ApiCallArgs<R>> & {
      mockResponse?: ApiResponse<T, E>;
    }
  ): Promise<ApiResponse<T, E>> => {
    if (params?.mockResponse) {
      return params.mockResponse;
    }

    if (this._abortController) {
      this._abortController.abort();
    }

    this._isLoading = true;
    this._isLoaded = false;
    this._isSuccess = false;
    this._isFailed = false;

    this._abortController = new AbortController();

    const requestConfig: AxiosRequestConfig = {
      url: this._requestParams.url,
      method: this._requestParams.method,
      params: params?.params ?? this._requestParams.params,
      data: params?.data ?? this._requestParams.data,
      headers: {
        ...(this._requestParams.headers ?? {}),
        ...(params?.headers ?? {}),
      },
      signal: this._abortController.signal,
    };

    let response: ApiResponse<T, E>;

    try {
      const axiosResponse = await this._axiosInstance.request<T>({
        ...requestConfig,
        method: requestConfig.method ?? 'GET',
      });

      this._isSuccess = true;

      response = {
        isError: false,
        data: axiosResponse.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError<E>;
      const isCancelled =
        axios.isCancel?.(axiosError) ||
        axiosError?.code === 'ERR_CANCELED' ||
        this._abortController?.signal.aborted;

      this._isFailed = !isCancelled;

      response = {
        isError: true,
        isCancelled,
        data: axiosError.response?.data,
      };
    } finally {
      this._isLoading = false;
      this._isLoaded = true;
      this._abortController = null;
    }

    if (response.isError && !response.isCancelled) {
      this._handleError(response.data);
    }

    return response;
  };

  cancel(): void {
    this._abortController?.abort();
  }

  reset(): void {
    this._isLoading = false;
    this._isSuccess = false;
    this._isFailed = false;
    this._isLoaded = false;
  }

  destroy(): void {
    this.cancel();
    this.reset();
  }

  private _handleError(data?: ErrorResponse): void {
    const errorCode = data?.code;
    const errorMessage =
      errorCode && this._errorResponseMap ? this._errorResponseMap[errorCode] : null;

    if (this._showExpectedError && errorMessage) {
      this._rootStore.snackbarStore.openSnackbarMessage(errorMessage);
    } else if (this._showUnexpectedError && !errorMessage) {
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();
    }

    console.log({ error: errorCode ?? 'unknown', url: this._requestUrl });
  }
}
