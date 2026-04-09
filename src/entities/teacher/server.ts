export type BackendTeacherReview = {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
};

export type BackendTeacherCourse = {
  id: number;
  name: string;
  dance_style: string;
  level: string;
  price: number;
  date_from: string;
  date_to: string;
  status: string;
  studio: string;
};

export type BackendTeacherListItem = {
  id: number;
  full_name: string;
  bio: string;
  experience_years: number;
  rating_avg: number | string;
  rating_count: number;
  city: string;
};

export type BackendTeacher = {
  id: number;
  user_id: number;
  full_name: string;
  name: string;
  email: string;
  avatar: string;
  city: string;
  bio: string;
  images: string[];
  experience: number;
  rating: number | string;
  specializations: string[];
  achievements: string[];
  reviews: BackendTeacherReview[];
  courses: BackendTeacherCourse[];
};
