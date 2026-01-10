export enum ErrorCodeEnum {
  notAuthorized = 'not_authorized',
  internalError = 'internal_error',
}

export type ApiResponse<T, E> =
  | {
      isError: true;
      isCancelled: boolean;
      data?: E;
    }
  | {
      isError: false;
      data: T;
    };

export type ErrorResponse = {
  code?: ErrorCodeEnum;
  message?: string;
  status?: string | number;
};

export enum LSKey {
  token = 'token',
}
