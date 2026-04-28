/**
 * Одна строка «по занятию» в ответе статистики (snake_case, как от API).
 */
export type CourseAttendanceLessonStatsServer = {
  lesson_id: number;

  /** Дата занятия, ISO-календарная строка YYYY-MM-DD */
  date: string;
  present: number;
  absent: number;
  total: number;
  percent: number;
};

/**
 * Одна строка «по ученику» в ответе статистики.
 */
export type CourseAttendanceStudentStatsServer = {
  student_id: number;
  student_name: string;
  attended: number;
  missed: number;
  total: number;
  percent: number;
};

/**
 * Сырой ответ GET `/api/courses/:id/attendance-stats/` (snake_case).
 */
export type CourseAttendanceStatsServer = {
  total_lessons: number;
  conducted_lessons: number;
  cancelled_lessons: number;
  avg_attendance_percent: number;
  total_students: number;
  per_lesson: CourseAttendanceLessonStatsServer[];
  per_student: CourseAttendanceStudentStatsServer[];
};
