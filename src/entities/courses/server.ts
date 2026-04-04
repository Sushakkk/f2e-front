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
  image: string;
  teacher_name: string;
  dance_style: string;
  city: string;
  studio: string;
  schedule: ScheduleEntryServer[];
};

export type CourseListResponseServer = CourseListItemServer[] | { results: CourseListItemServer[] };
