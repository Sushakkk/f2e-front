import { LEVEL_FROM_API } from 'entities/course/config';
import type { CalendarEvent } from 'pages/CalendarPage/utils';

import type { CalendarEventServer } from './server';

function parseDateTime(dateTime: string, fallbackDate: string, fallbackTime: string): Date {
  const normalized = dateTime || `${fallbackDate}T${fallbackTime}`;

  return new Date(normalized);
}

export function normalizeCalendarEvent(data: CalendarEventServer): CalendarEvent {
  return {
    id: data.id,
    title: data.course_name,
    start: parseDateTime(data.start, data.lesson_date, data.time_from),
    end: parseDateTime(data.end, data.lesson_date, data.time_to),
    courseId: data.course_id,
    type: data.dance_style,
    teacher: data.teacher_name,
    studio: data.studio,
    level: LEVEL_FROM_API[data.level as keyof typeof LEVEL_FROM_API] ?? data.level,
    location: data.location_text ?? data.city,
    courseFrom: data.lesson_date,
    courseTo: data.lesson_date,
  };
}
