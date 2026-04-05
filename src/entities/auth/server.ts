import type { BackendUser } from 'entities/user';

export type BackendAuthResponse = {
  user: BackendUser;
  access: string;
  refresh: string;
};

export type LoginRequestServer = {
  email: string;
  password: string;
};

export type RegisterRequestServer = {
  email: string;
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirm: string;
};

export type RefreshTokenRequestServer = {
  refresh: string;
};

export type RefreshTokenResponseServer = {
  access: string;
  refresh?: string;
};

export type LogoutRequestServer = {
  refresh: string;
};
