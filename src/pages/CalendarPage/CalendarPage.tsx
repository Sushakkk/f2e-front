import { observer } from 'mobx-react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { COURSES_CONFIG } from 'config/cards';

import { generateCalendarEvents, TYPE_COLORS } from './utils';
import type { CalendarEvent } from './utils';

import s from './CalendarPage.module.scss';

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
const MAX_TIME = new Date(1970, 0, 1, 23, 0);

const FORMATS = {
  weekdayFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
    loc ? loc.format(date, 'EEEEEE', culture) : '',
  dayHeaderFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
    loc ? loc.format(date, 'EEEEEE, d MMMM', culture) : '',
  dayRangeHeaderFormat: (
    { start, end }: { start: Date; end: Date },
    culture?: string,
    loc?: typeof localizer,
  ) => (loc ? `${loc.format(start, 'd MMM', culture)} – ${loc.format(end, 'd MMM', culture)}` : ''),
};

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events = useMemo(() => generateCalendarEvents(COURSES_CONFIG), []);

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: TYPE_COLORS[event.type] || '#7707b8',
        borderRadius: '6px',
        border: 'none',
        color: '#fff',
        fontSize: '12px',
        padding: '2px 6px',
        cursor: 'pointer',
      },
    }),
    [],
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleNavigateToCourse = useCallback(() => {
    if (selectedEvent) {
      navigate(`/course/${selectedEvent.courseId}`);
    }
  }, [navigate, selectedEvent]);

  const closePopup = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const typeEntries = useMemo(() => Object.entries(TYPE_COLORS), []);

  return (
    <div className={s.page}>
      <h1 className={s.title}>Календарь курсов</h1>

      <div className={s.legend}>
        {typeEntries.map(([type, color]) => (
          <span key={type} className={s.legendItem}>
            <span className={s.legendDot} style={{ backgroundColor: color }} />
            {type}
          </span>
        ))}
      </div>

      <div className={s.calendarWrapper}>
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
              style={{ backgroundColor: TYPE_COLORS[selectedEvent.type] || '#7707b8' }}
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
                <span className={s.popupLabel}>Время</span>
                <span>
                  {format(selectedEvent.start, 'HH:mm')} – {format(selectedEvent.end, 'HH:mm')}
                </span>
              </div>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Дата</span>
                <span>{format(selectedEvent.start, 'd MMMM yyyy', { locale: ru })}</span>
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
