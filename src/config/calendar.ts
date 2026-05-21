import type { Enrollment } from 'config/users';

export type CalendarFilterMode = 'all' | 'enrolled' | 'my';

export const MOCK_ENROLLMENTS: Enrollment[] = [
  { courseId: 3, enrolledAt: '2025-02-01', status: 'active', paid: true },
  { courseId: 6, enrolledAt: '2025-02-10', status: 'active', paid: true },
  { courseId: 7, enrolledAt: '2025-02-05', status: 'active', paid: true },
];

export const MOCK_TEACHER_ID = 11;

export const FILTER_MODE_OPTIONS: { value: CalendarFilterMode; label: string }[] = [
  { value: 'all', label: 'Все курсы' },
  { value: 'enrolled', label: 'Мои записи' },
  { value: 'my', label: 'Мои курсы' },
];

export const CALENDAR_MESSAGES = {
  today: 'Сегодня',
  previous: '←',
  next: '→',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  agenda: 'Список',
  date: 'Дата',
  time: 'Время',
  event: 'Событие',
  noEventsInRange: 'Нет занятий в этом периоде',
  showMore: (total: number) => `ещё ${total}`,
};

export const MIN_TIME = new Date(1970, 0, 1, 8, 0);

export const MAX_TIME = new Date(1970, 0, 1, 23, 59);

export type CalendarFormatsLocale = {
  format: (date: Date, formatStr: string, culture?: string) => string;
};

export const CALENDAR_FORMATS = {
  monthHeaderFormat: (date: Date, culture?: string, loc?: CalendarFormatsLocale) =>
    loc ? loc.format(date, 'LLLL yyyy', culture) : '',
  weekdayFormat: (date: Date, culture?: string, loc?: CalendarFormatsLocale) =>
    loc ? loc.format(date, 'EEEEEE', culture) : '',
  dayFormat: (date: Date, culture?: string, loc?: CalendarFormatsLocale) =>
    loc ? loc.format(date, 'EEEEEE d', culture) : '',
  dayHeaderFormat: (date: Date, culture?: string, loc?: CalendarFormatsLocale) =>
    loc ? loc.format(date, 'EEEEEE, d MMMM', culture) : '',
  dayRangeHeaderFormat: (
    { start, end }: { start: Date; end: Date },
    culture?: string,
    loc?: CalendarFormatsLocale
  ) => (loc ? `${loc.format(start, 'd MMM', culture)} – ${loc.format(end, 'd MMM', culture)}` : ''),
  timeGutterFormat: (date: Date, culture?: string, loc?: CalendarFormatsLocale) =>
    loc ? loc.format(date, 'H:mm', culture) : '',
  eventTimeRangeFormat: (
    { start, end }: { start: Date; end: Date },
    culture?: string,
    loc?: CalendarFormatsLocale
  ) => (loc ? `${loc.format(start, 'H:mm', culture)} –\n${loc.format(end, 'H:mm', culture)}` : ''),
};
