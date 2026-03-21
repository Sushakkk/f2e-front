/**
 * Формат ответа API курсов (Dancehub).
 * Поля в snake_case как приходят с бэка.
 */

export type ScheduleEntryServer = {
  weekday: string;
  timeFrom: string;
  timeTo: string;
  location?: string | null;
};

export type CourseListItemServer = {
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
  teacher_id: number;
  teacher_name: string;
  dance_style: string;
  dance_style_slug: string;
  city: string;
  studio: string;
  schedule: ScheduleEntryServer[];
};

export type CourseListResponseServer = CourseListItemServer[] | { results: CourseListItemServer[] };
