import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { SelectDropdown } from 'components/common';
import type { ProfilePageStore } from 'store/ProfilePageStore';

import s from './TeacherSchedule.module.scss';

type Props = {
  store: ProfilePageStore;
};

const TeacherSchedule: React.FC<Props> = ({ store }) => {
  const courseOptions = React.useMemo(
    () =>
      store.activeCourses.map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [store.activeCourses]
  );

  React.useEffect(() => {
    if (!store.selectedCourseId && store.activeCourses.length > 0) {
      store.setSelectedCourse(store.activeCourses[0].id);
    }
  }, [store, store.activeCourses.length, store.selectedCourseId]);

  const handleCourseChange = React.useCallback(
    (value: string) => {
      store.setSelectedCourse(Number(value));
    },
    [store]
  );

  const handleCancelLesson = React.useCallback(
    (lessonId: number) => {
      void store.cancelLesson(lessonId);
    },
    [store]
  );

  return (
    <div className={s.root}>
      <div className={s.selector}>
        <label className={s.label}>Курс</label>
        <SelectDropdown
          mode="single"
          value={store.selectedCourseId ? String(store.selectedCourseId) : ''}
          placeholder="Выберите курс"
          options={courseOptions}
          onChange={handleCourseChange}
        />
      </div>
      {store.selectedCourseId && store.lessons.length === 0 && (
        <div className={s.empty}>Нет занятий для этого курса</div>
      )}
      {store.lessons.length > 0 && (
        <div className={s.list}>
          <div className={s.listHeader}>
            <span className={s.colDate}>Дата</span>
            <span className={s.colTime}>Время</span>
            <span className={s.colLocation}>Место</span>
            <span className={s.colStatus}>Статус</span>
            <span className={s.colAction} />
          </div>
          {store.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={cx(s.row, lesson.status === 'cancelled' && s.row_cancelled)}
            >
              <span className={s.colDate}>{lesson.date}</span>
              <span className={s.colTime}>
                {lesson.timeFrom}–{lesson.timeTo}
              </span>
              <span className={s.colLocation}>{lesson.location ?? '—'}</span>
              <span className={cx(s.colStatus, s[`status_${lesson.status}`])}>
                {lesson.status === 'scheduled' ? 'Запланировано' : 'Отменено'}
              </span>
              <span className={s.colAction}>
                {lesson.status === 'scheduled' && (
                  <button className={s.cancelBtn} onClick={() => handleCancelLesson(lesson.id)}>
                    Отменить
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default observer(TeacherSchedule);
