import type { UserClient } from 'entities/user';

export type AuthClient = {
  user: UserClient;
  accessToken: string;
  refreshToken: string;
};
