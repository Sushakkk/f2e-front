import type { Enrollment } from 'config/users';

export type UserFlags = Record<string, boolean>;

export enum UserRole {
  teacher = 'teacher',
  student = 'student',
}

export type TeacherProfileClient = {
  bio: string;
  images: string[];
  achievements: string[];
  experience: number;
  specializations: string[];
  rating: number;
};

export type UserClient = {
  id: number;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  city: string;
  level: string;
  role: UserRole;
  teacher?: TeacherProfileClient;
  registeredAt: string;
  flags?: UserFlags;
  enrollments?: Enrollment[];
  favoriteCourseIds?: number[];
  favoriteTeacherNames?: string[];
  preferredTimeFrom?: string;
  preferredTimeTo?: string;
  priceFrom?: string | number | null;
  priceTo?: string | number | null;
  preferredWeekdays?: string[];
  preferredDanceStyles?: string[];
};

export type ApiGetUserType<UserT = UserClient> = {
  user: UserT;
};

export type ApiAuthType<UserT = UserClient> = ApiGetUserType<UserT> & {
  messages_allowed?: boolean;
};

export type FlagParamsType = {
  name: string;
  value: boolean;
  withLoadingCheck?: boolean;
};
