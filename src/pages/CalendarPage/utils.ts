import { addDays, getDay } from 'date-fns';

import type { CalendarFilterMode } from 'config/calendar';
import type { CourseConfigItem, ScheduleEntry } from 'config/cards';

export function parseCourseStartDate(dateStr: string): Date {
  if (dateStr.includes('-')) {
    return new Date(dateStr);
  }

  const [day, month] = dateStr.split('.').map(Number);

  return new Date(new Date().getFullYear(), month - 1, day);
}

export function getDateToNavigate(
  selectedCourseId: string,
  filteredCourses: CourseConfigItem[],
  currentDate: Date
): Date | null {
  if (selectedCourseId === 'all') {
    return new Date();
  }

  if (filteredCourses.length === 0) {
    return null;
  }

  const course = filteredCourses[0];
  const courseStart = parseCourseStartDate(course.dateFrom);
  const sameMonth =
    currentDate.getMonth() === courseStart.getMonth() &&
    currentDate.getFullYear() === courseStart.getFullYear();

  return sameMonth ? null : courseStart;
}

export function getCourseOptionsForMode(
  mode: CalendarFilterMode,
  allCourses: CourseConfigItem[],
  enrolledCourses: CourseConfigItem[],
  myCourses: CourseConfigItem[]
): SelectOption[] {
  const allLabel =
    mode === 'all' ? 'Все курсы' : mode === 'enrolled' ? 'Все мои записи' : 'Все мои курсы';
  const opts: SelectOption[] = [{ value: 'all', label: allLabel }];
  const list = mode === 'all' ? allCourses : mode === 'enrolled' ? enrolledCourses : myCourses;

  for (const c of list) {
    opts.push({ value: String(c.id), label: c.name });
  }

  return opts;
}

export function getFilteredCourses(
  mode: CalendarFilterMode,
  selectedCourseId: string,
  allCourses: CourseConfigItem[],
  enrolledCourses: CourseConfigItem[],
  myCourses: CourseConfigItem[]
): CourseConfigItem[] {
  const list = mode === 'enrolled' ? enrolledCourses : mode === 'my' ? myCourses : allCourses;

  if (selectedCourseId === 'all') {
    return list;
  }

  const id = Number(selectedCourseId);

  return list.filter((c) => c.id === id);
}

export type SelectOption = { value: string; label: string };

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
  courseFrom: string;
  courseTo: string;
};

const COURSE_PALETTE = [
  '#d81b60',
  '#1e88e5',
  '#f57c00',
  '#8e24aa',
  '#43a047',
  '#e8a317',
  '#e53935',
  '#00897b',
  '#5c6bc0',
  '#00acc1',
  '#c0ca33',
  '#ff7043',
  '#ab47bc',
  '#26a69a',
  '#ec407a',
];

export function getCourseColor(courseId: number, courseIds: number[]): string {
  const idx = courseIds.indexOf(courseId);

  return COURSE_PALETTE[(idx === -1 ? courseId : idx) % COURSE_PALETTE.length];
}

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
  if (course.schedule) {
    return course.schedule;
  }

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
            location: entry.location ?? course.location,
            courseFrom: course.dateFrom,
            courseTo: course.dateTo,
          });
        }

        current = addDays(current, 1);
      }
    }
  }

  return events;
}
