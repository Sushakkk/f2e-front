import { formatClockToHhMm } from 'utils/dateUtils';

import type { CourseLessonClient } from './client';
import type { CourseLessonServer } from './server';

/** Maps backend lesson.status to client union (scheduled | cancelled | completed). */
function normalizeLessonStatus(status: string): CourseLessonClient['status'] {
  if (status === 'cancelled') {
    return 'cancelled';
  }

  if (status === 'completed') {
    return 'completed';
  }

  return 'scheduled';
}

export function normalizeCourseLesson(data: CourseLessonServer): CourseLessonClient {
  return {
    id: data.id,
    courseId: data.course_id,
    date: data.lesson_date,
    timeFrom: formatClockToHhMm(data.time_from),
    timeTo: formatClockToHhMm(data.time_to),
    location: data.location_text ?? data.hall ?? undefined,
    studio: data.studio ?? undefined,
    status: normalizeLessonStatus(data.status),
    canMarkAttendance: data.can_mark_attendance ?? false,
  };
}
