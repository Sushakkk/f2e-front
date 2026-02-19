import { addDays, getDay } from 'date-fns';

import type { CourseConfigItem, ScheduleEntry } from 'config/cards';

export type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  courseId: number;
  type: string;
  teacher: string;
  studio: string;
  level: string;
  location?: string;
};

export const TYPE_COLORS: Record<string, string> = {
  'High Heels': '#d81b60',
  Contemporary: '#1e88e5',
  'Jazz Funk': '#f57c00',
  Vogue: '#8e24aa',
  'Hip-Hop': '#43a047',
  Dancehall: '#e8a317',
  'Frame Up': '#e53935',
  Stretching: '#00897b',
  'Lady Style': '#ad1457',
};

const WEEKDAY_MAP: Record<string, number> = {
  Вс: 0,
  Пн: 1,
  Вт: 2,
  Ср: 3,
  Чт: 4,
  Пт: 5,
  Сб: 6,
};

function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function parseCourseDate(dateStr: string, year: number): Date {
  const [day, month] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
}

function getScheduleEntries(course: CourseConfigItem): ScheduleEntry[] {
  if (course.schedule) return course.schedule;
  if (course.weekdays && course.timeFrom && course.timeTo) {
    return course.weekdays.map((weekday) => ({
      weekday,
      timeFrom: course.timeFrom!,
      timeTo: course.timeTo!,
      location: course.location,
    }));
  }
  return [];
}

function getWeekdayNumbers(weekdayStr: string): number[] {
  return weekdayStr
    .split(',')
    .map((s) => WEEKDAY_MAP[s.trim()])
    .filter((n): n is number => n !== undefined);
}

export function generateCalendarEvents(courses: CourseConfigItem[]): CalendarEvent[] {
  const currentYear = new Date().getFullYear();
  const events: CalendarEvent[] = [];
  let eventId = 0;

  for (const course of courses) {
    const startDate = parseCourseDate(course.dateFrom, currentYear);
    const endDate = parseCourseDate(course.dateTo, currentYear);
    const entries = getScheduleEntries(course);

    for (const entry of entries) {
      const weekdayNumbers = getWeekdayNumbers(entry.weekday);
      let current = new Date(startDate);

      while (current <= endDate) {
        if (weekdayNumbers.includes(getDay(current))) {
          events.push({
            id: eventId++,
            title: course.name,
            start: parseTime(entry.timeFrom, current),
            end: parseTime(entry.timeTo, current),
            courseId: course.id,
            type: course.type,
            teacher: course.teacher.name,
            studio: course.studio,
            level: course.level,
            location: entry.location || course.location,
          });
        }
        current = addDays(current, 1);
      }
    }
  }

  return events;
}
