export type ApiAuth = {
  user: string;
  token: string;
};

export type {
  ApiAuthType,
  ApiGetUserType,
  BackendUser,
  FlagParamsType,
  UserClient,
  UserFlags,
} from 'entities/user';

export { normalizeUser } from 'entities/user';
