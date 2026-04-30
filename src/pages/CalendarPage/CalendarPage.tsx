import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Navigate, generatePath, useNavigate } from 'react-router-dom';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { SelectDropdown } from 'components/common';
import {
  CALENDAR_FORMATS,
  CALENDAR_MESSAGES,
  FILTER_MODE_OPTIONS,
  MAX_TIME,
  MIN_TIME,
  type CalendarFilterMode,
} from 'config/calendar';
import { RoutePath } from 'config/router/paths';
import { CalendarPageStore } from 'store/CalendarPageStore';
import { useRootStore } from 'store/globals/root';
import { useLocalStore, useUserStore } from 'store/hooks';

import s from './CalendarPage.module.scss';
import { getCourseColor } from './utils';
import type { CalendarEvent } from './utils';

const locales = { ru };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage: React.FC = () => {
  const rootStore = useRootStore();
  const userStore = useUserStore();
  const navigate = useNavigate();
  const store = useLocalStore(() => new CalendarPageStore(rootStore));

  useEffect(() => {
    if (!userStore.user) {
      return;
    }

    void store.loadEvents();
  }, [store, store.filterMode, userStore.user]);

  useEffect(() => {
    store.navigateToAppropriateDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.selectedCourseId, store.filterMode, store.events]);

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: getCourseColor(event.courseId, store.courseIds),
        borderRadius: '6px',
        border: 'none',
        color: '#fff',
        fontSize: '12px',
        padding: '2px 6px',
        cursor: 'pointer',
      },
    }),
    [store.courseIds]
  );

  const handleNavigateToCourse = useCallback(() => {
    if (store.selectedEvent) {
      navigate(generatePath(RoutePath.course, { id: String(store.selectedEvent.courseId) }));
    }
  }, [navigate, store.selectedEvent]);

  if (!userStore.user) {
    return <Navigate to={RoutePath.auth} replace />;
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Календарь курсов</h1>
      <div className={s.filters}>
        <div className={s.filterField}>
          <label className={s.filterLabel}>Отображение</label>
          <SelectDropdown
            mode="single"
            value={store.effectiveFilterMode}
            options={FILTER_MODE_OPTIONS}
            placeholder="Выберите"
            onChange={(v) => store.handleFilterModeChange(v as CalendarFilterMode)}
          />
        </div>
        {store.courseOptionsForMode.length > 1 && (
          <div className={s.filterField}>
            <label className={s.filterLabel}>Курс</label>
            <SelectDropdown
              mode="single"
              value={store.selectedCourseId}
              options={store.courseOptionsForMode}
              placeholder="Выберите курс"
              onChange={store.setSelectedCourseId}
            />
          </div>
        )}
      </div>
      <div className={s.calendarWrapper} data-view={store.view}>
        {store.isLoading && <div className={s.state}>Загрузка календаря...</div>}
        {store.loadError && !store.isLoading && (
          <div className={s.state}>Не удалось загрузить календарь</div>
        )}
        {!store.isLoading && !store.loadError && (
          <Calendar<CalendarEvent>
            localizer={localizer}
            events={store.events}
            view={store.view}
            onView={store.setView}
            date={store.date}
            onNavigate={store.setDate}
            views={['month', 'week', 'day']}
            culture="ru"
            messages={CALENDAR_MESSAGES}
            formats={CALENDAR_FORMATS}
            eventPropGetter={eventPropGetter}
            onSelectEvent={store.setSelectedEvent}
            popup
            showAllEvents
            min={MIN_TIME}
            max={MAX_TIME}
            step={30}
            timeslots={2}
          />
        )}
      </div>
      {store.selectedEvent && (
        <div className={s.overlay} onClick={() => store.setSelectedEvent(null)}>
          <div className={s.popup} onClick={(e) => e.stopPropagation()}>
            <button className={s.popupClose} onClick={() => store.setSelectedEvent(null)}>
              ×
            </button>
            <div
              className={s.popupType}
              style={{
                backgroundColor: getCourseColor(store.selectedEvent.courseId, store.courseIds),
              }}
            >
              {store.selectedEvent.type}
            </div>
            <h2 className={s.popupTitle}>{store.selectedEvent.title}</h2>
            <div className={s.popupDetails}>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Преподаватель</span>
                <span>{store.selectedEvent.teacher}</span>
              </div>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Студия</span>
                <span>{store.selectedEvent.studio}</span>
              </div>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Уровень</span>
                <span>{store.selectedEvent.level}</span>
              </div>
              {store.selectedEvent.location && (
                <div className={s.popupRow}>
                  <span className={s.popupLabel}>Место</span>
                  <span>{store.selectedEvent.location}</span>
                </div>
              )}
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Дата занятия</span>
                <span>
                  {format(store.selectedEvent.start, 'd MMMM yyyy', {
                    locale: ru,
                  })}
                </span>
              </div>
              <div className={s.popupRow}>
                <span className={s.popupLabel}>Время</span>
                <span>
                  {format(store.selectedEvent.start, 'HH:mm')} –{' '}
                  {format(store.selectedEvent.end, 'HH:mm')}
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
