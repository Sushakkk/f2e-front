export type ScheduleEntryServer = {
  weekday: string;
  time_from: string;
  time_to: string;
};

export type CourseListItemServer = {
  id: number;
  name: string;
  level: string;
  price: number;
  date_from: string;
  date_to: string;
  /** Витрина: active | completed по date_to (см. CourseLifecycleStatus на бэке). */
  status?: string;
  image: string;
  teacher_id?: number;
  teacher_name: string;
  dance_style: string;
  city: string;
  studio: string;
  schedule: ScheduleEntryServer[];
  spots_left: number;
};

export type CourseListResponseServer = CourseListItemServer[] | { results: CourseListItemServer[] };
