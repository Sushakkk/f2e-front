import { formatRu } from 'utils/dateUtils';

import type { CourseAttendanceStatsClient } from './client';
import type { CourseAttendanceStatsServer } from './server';

const toIsoDateKey = (value: string): string => {
  if (value.length >= 10) {
    return value.slice(0, 10);
  }

  return value;
};

/**
 * Преобразует ответ статистики посещаемости в camelCase для UI.
 *
 * @param data объект ответа API
 * @returns модель для раздела «Статистика»
 */
export function normalizeCourseAttendanceStats(
  data: CourseAttendanceStatsServer
): CourseAttendanceStatsClient {
  return {
    totalLessons: data.total_lessons,
    conductedLessons: data.conducted_lessons,
    cancelledLessons: data.cancelled_lessons,
    avgAttendancePercent: data.avg_attendance_percent,
    totalStudents: data.total_students,
    perLesson: data.per_lesson.map((row) => ({
      lessonId: row.lesson_id,
      date: formatRu(toIsoDateKey(row.date)),
      present: row.present,
      absent: row.absent,
      total: row.total,
      percent: row.percent,
    })),
    perStudent: data.per_student.map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      attended: row.attended,
      missed: row.missed,
      total: row.total,
      percent: row.percent,
    })),
  };
}
