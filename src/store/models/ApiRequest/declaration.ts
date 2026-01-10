import { ApiMethod } from 'config/api/types';
import { ErrorResponse as BaseErrorResponse, ApiResponse } from 'store/globals/api/types';

export type ApiCallArgs<R = Record<string, unknown>> = {
  url: string;
  method?: ApiMethod;
  params?: Record<string, unknown>;
  data?: R;
  headers?: Record<string, string>;
};

export interface IApiRequest<
  ResponseData,
  ErrorResponse extends BaseErrorResponse = BaseErrorResponse,
> {
  isLoading: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  isLoaded: boolean;

  call: <
    T extends ResponseData,
    E extends ErrorResponse,
    R extends Record<string, unknown> | FormData = Record<string, unknown>,
  >(
    params?: Partial<ApiCallArgs<R>> & {
      mockResponse?: ApiResponse<T, E>;
    }
  ) => Promise<ApiResponse<T, E>>;

  cancel: () => void;
  reset: () => void;
  destroy: () => void;
}
