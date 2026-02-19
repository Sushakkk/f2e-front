import type { UserConfig } from 'config/users';

export type MockSession = {
  userId: number;
  token: string;
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  level?: string;
};

export type MockUserData = Omit<UserConfig, 'password'> & {
  favoriteCourseIds: number[];
  favoriteTeacherNames: string[];
};

export type MockAuthResult =
  | {
      success: true;
      user: MockUserData;
      token: string;
    }
  | {
      success: false;
      error: string;
    };

export type FavoritesData = {
  courseIds: number[];
  teacherNames: string[];
};

export type FavoritesMap = Record<number, FavoritesData>;

export type CourseSpotsMap = Record<number, number>;
