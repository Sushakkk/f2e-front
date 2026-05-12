/**
 * Элемент расписания курса с API (детальная карточка).
 */
export type ScheduleEntryServer = {
  weekday: string;
  time_from: string;
  time_to: string;
  location?: string | null;
  studio?: string | null;
  studio_id?: number | null;
};

export type CourseDetailServer = {
  id: number;
  name: string;
  description: string;
  level: string;
  price: number;
  capacity: number;
  spots_left: number;
  date_from: string;
  date_to: string;
  status: string;
  images: string[];
  teacher_id?: number;
  teacher_name: string;
  dance_style: string;
  city: string;
  studio: string;
  schedule: ScheduleEntryServer[];
  music: {
    artist: string;
    track: string;
    url: string;
  };
  can_enroll?: boolean;
  can_cancel_enrollment?: boolean;
  can_edit?: boolean;
  first_lesson_at?: string | null;
  viewer_enrollment_status?: string | null;
};

export type CourseDetailResponseServer = CourseDetailServer;
