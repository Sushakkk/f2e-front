import type { Review } from 'config/cards';

export type TeacherCoursePreview = {
  id: number;
  name: string;
  studio: string;
  danceStyle: string;
  level: string;
  price: number;
  dateFrom: string;
  dateTo: string;
  status: string;
};

export type TeacherClient = {
  id: number;
  userId: number;
  name: string;
  fullName: string;
  email: string;
  avatar?: string;
  city: string;
  bio: string;
  images: string[];
  experience: number;
  rating: number;
  specializations: string[];
  achievements: string[];
  reviews: Review[];
  courses: TeacherCoursePreview[];
};
