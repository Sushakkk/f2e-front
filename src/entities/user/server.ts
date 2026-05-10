import { UserRole } from './client';

export type BackendTeacherProfile = {
  bio: string;
  images: string[];
  achievements: string[];
  experience: number;
  specializations: string[];
  rating: number;
};

export type BackendUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone?: string | null;
  avatar?: string | null;
  city: string | null;
  dance_level: string;
  role: UserRole;
  survey_completed?: boolean;
  teacher?: BackendTeacherProfile | null;
  favorite_course_ids?: number[];
  favorite_teacher_ids?: number[];
  favorite_teacher_names?: string[];
  preferred_time_from?: string | null;
  preferred_time_to?: string | null;
  price_from?: string | number | null;
  price_to?: string | number | null;
  preferred_weekdays?: string[];
  preferred_dance_styles?: string[];
};
