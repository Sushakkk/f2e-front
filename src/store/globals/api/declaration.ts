import { SnackbarServerMessageList } from 'config/snackbars';
import { ErrorResponse } from 'store/globals/api/types';
import { ApiCallArgs, IApiRequest } from 'store/models/ApiRequest/declaration';

export interface IApiStore {
  createExtendedRequest: <ResponseData, BaseErrorResponse extends ErrorResponse>(
    requestParams: ApiCallArgs & {
      errorMap?: SnackbarServerMessageList;
      showExpectedError?: boolean;
      showUnexpectedError?: boolean;
    }
  ) => IApiRequest<ResponseData, BaseErrorResponse>;

  setAuthToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setAuthTokens: (tokens: { accessToken: string | null; refreshToken?: string | null }) => void;
  clearAuthData: () => void;
  refreshAccessToken: () => Promise<string | null>;
}
