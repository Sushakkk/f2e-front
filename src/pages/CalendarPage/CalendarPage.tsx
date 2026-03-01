import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { Navigate, generatePath, useNavigate } from 'react-router-dom';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { RoutePath } from 'config/router/paths';
import { MockDb } from 'services/mockDb';
import { useUserStore } from 'store/hooks';

import s from './CalendarPage.module.scss';
import { generateCalendarEvents, getCourseColor } from './utils';
import type { CalendarEvent } from './utils';

const locales = { ru };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MESSAGES = {
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

const MIN_TIME = new Date(1970, 0, 1, 8, 0);
const MAX_TIME = new Date(1970, 0, 1, 23, 59);

const FORMATS = {
  weekdayFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
    loc ? loc.format(date, 'EEEEEE', culture) : '',
  dayFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
    loc ? loc.format(date, 'EEEEEE d', culture) : '',
  dayHeaderFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
    loc ? loc.format(date, 'EEEEEE, d MMMM', culture) : '',
  dayRangeHeaderFormat: (
    { start, end }: { start: Date; end: Date },
    culture?: string,
    loc?: typeof localizer
  ) => (loc ? `${loc.format(start, 'd MMM', culture)} – ${loc.format(end, 'd MMM', culture)}` : ''),
  timeGutterFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
    loc ? loc.format(date, 'H:mm', culture) : '',
  eventTimeRangeFormat: (
    { start, end }: { start: Date; end: Date },
    culture?: string,
    loc?: typeof localizer
  ) => (loc ? `${loc.format(start, 'H:mm', culture)} –\n${loc.format(end, 'H:mm', culture)}` : ''),
};

const CalendarPage: React.FC = () => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const enrolledCourses = useMemo(() => {
    const enrollments = MockDb.getUserEnrollments();
    const activeIds = enrollments
      .filter((e) => e.status === 'active' || e.status === 'pending')
      .map((e) => e.courseId);

    return MockDb.getCourses().filter((c) => activeIds.includes(c.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStore.user]);

  const events = useMemo(() => generateCalendarEvents(enrolledCourses), [enrolledCourses]);

  const courseIds = useMemo(() => enrolledCourses.map((c) => c.id), [enrolledCourses]);

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: getCourseColor(event.courseId, courseIds),
        borderRadius: '6px',
        border: 'none',
        color: '#fff',
        fontSize: '12px',
        padding: '2px 6px',
        cursor: 'pointer',
      },
    }),
    [courseIds]
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleNavigateToCourse = useCallback(() => {
    if (selectedEvent) {
      navigate(generatePath(RoutePath.course, { id: String(selectedEvent.courseId) }));
    }
  }, [navigate, selectedEvent]);

  const closePopup = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  if (!userStore.user) {
    return <Navigate to={RoutePath.auth} replace />;
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Календарь курсов</h1>
      <div className={s.calendarWrapper} data-view={view}>
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month', 'week', 'day']}
          culture="ru"
          messages={MESSAGES}
          formats={FORMATS}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          popup
          min={MIN_TIME}
          max={MAX_TIME}
          step={30}
          timeslots={2}
        />
      </div>
      {selectedEvent && (
        <div className={s.overlay} onClick={closePopup}>
          <div className={s.popup} onClick={(e) => e.stopPropagation()}>
            <button className={s.popupClose} onClick={closePopup}>
              ×
            </button>
            <div
              className={s.popupType}
              style={{ backgroundColor: getCourseColor(selectedEvent.courseId, courseIds) }}
            >
              {selectedEvent.type}
            </div>
            <h2 className={s.popupTitle}>{selectedEvent.title}</h2>
            <div className={s.popupDetails}>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Преподаватель</span>
                <span>{selectedEvent.teacher}</span>
              </div>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Студия</span>
                <span>{selectedEvent.studio}</span>
              </div>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Уровень</span>
                <span>{selectedEvent.level}</span>
              </div>
              {selectedEvent.location && (
                <div className={s.popupRow}>
                  <span className={s.popupLabel}>Место</span>
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Дата занятия</span>
                <span>{format(selectedEvent.start, 'd MMMM yyyy', { locale: ru })}</span>
              </div>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Время</span>
                <span>
                  {format(selectedEvent.start, 'HH:mm')} – {format(selectedEvent.end, 'HH:mm')}
                </span>
              </div>
            </div>
            <button className={s.popupButton} onClick={handleNavigateToCourse}>
              Подробнее о курсе
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(CalendarPage);
