export type CalendarEventServer = {
  id: number;
  course_id: number;
  course_name: string;
  teacher_name: string;
  dance_style: string;
  level: string;
  lesson_date: string;
  time_from: string;
  time_to: string;
  start: string;
  end: string;
  location_text?: string | null;
  status: string;
  studio: string;
  city: string;
};

export type CalendarEventsResponseServer = CalendarEventServer[];
