export type CourseLessonServer = {
  id: number;
  course_id: number;
  lesson_date: string;
  time_from: string;
  time_to: string;
  location_text?: string | null;
  status: string;
  hall?: string | null;
  start_at?: string;
  can_mark_attendance?: boolean;
};

export type CourseLessonsResponseServer = CourseLessonServer[];
