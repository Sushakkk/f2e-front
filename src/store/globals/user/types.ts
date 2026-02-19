import type { Enrollment } from 'config/users';

export type ApiAuth = {
  user: string;
  token: string;
};

export type UserFlags = Record<string, boolean>;

export type UserServer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  city: string;
  level: string;
  registeredAt: string;
  flags?: UserFlags;
  enrollments?: Enrollment[];
  favoriteCourseIds?: number[];
  favoriteTeacherNames?: string[];
};

export type ApiGetUserType<UserT = UserServer> = {
  user: UserT;
};

export type ApiAuthType<UserT = UserServer> = ApiGetUserType<UserT> & {
  messages_allowed?: boolean;
};

export type FlagParamsType = {
  name: string;
  value: boolean;
  withLoadingCheck?: boolean;
};
