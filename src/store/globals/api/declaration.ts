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
}
