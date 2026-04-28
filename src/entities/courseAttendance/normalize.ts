import type { CourseAttendanceClient } from './client';
import type { CourseAttendanceServer } from './server';

export function normalizeCourseAttendance(data: CourseAttendanceServer): CourseAttendanceClient {
  return {
    lessonId: data.lesson_id,
    courseId: data.course_id,
    studentId: data.student_id,
    present: data.status === 'present',
    markedAt: data.marked_at,
  };
}
