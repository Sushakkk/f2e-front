import type { CourseLessonClient } from './client';
import type { CourseLessonServer } from './server';

export function normalizeCourseLesson(data: CourseLessonServer): CourseLessonClient {
  return {
    id: data.id,
    courseId: data.course_id,
    date: data.lesson_date,
    timeFrom: data.time_from,
    timeTo: data.time_to,
    location: data.location_text ?? data.hall ?? undefined,
    status: data.status === 'cancelled' ? 'cancelled' : 'scheduled',
  };
}
