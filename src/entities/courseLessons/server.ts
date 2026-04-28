export type CourseLessonServer = {
  id: number;
  course_id: number;
  lesson_date: string;
  time_from: string;
  time_to: string;
  location_text?: string | null;
  status: string;
  hall?: string | null;
};

export type CourseLessonsResponseServer = CourseLessonServer[];
