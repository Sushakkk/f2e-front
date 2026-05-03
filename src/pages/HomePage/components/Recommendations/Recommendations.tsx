import React, { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
import { CoverflowSwiper } from 'components';
import { CourseConfigItem } from 'config';
import { RoutePath } from 'config/router/paths';
import { getScheduleDisplay } from 'utils/scheduleUtils';

import s from './Recommendations.module.scss';

type Props = {
  items: CourseConfigItem[];
};

export const Recommendations: React.FC<Props> = ({ items }) => {
  const navigate = useNavigate();
  const getImage = useCallback((it: CourseConfigItem) => it.images?.[0] || fallbackImage, []);
  const getKey = useCallback((it: CourseConfigItem) => it.id, []);
  const getAlt = useCallback((it: CourseConfigItem) => it.name, []);

  const goToCourse = useCallback(
    (item: CourseConfigItem) => {
      if (item.id) {
        navigate(generatePath(RoutePath.course, { id: String(item.id) }));
      }
    },
    [navigate]
  );

  const goToTeacher = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, teacherId?: number) => {
      e.stopPropagation();

      if (teacherId) {
        navigate(generatePath(RoutePath.teacher, { id: String(teacherId) }));
      }
    },
    [navigate]
  );

  return (
    <CoverflowSwiper
      items={items}
      getImage={getImage}
      getKey={getKey}
      getAlt={getAlt}
      onItemClick={goToCourse}
    >
      {(it: CourseConfigItem) => {
        const schedule = getScheduleDisplay(it);

        return (
          <>
            {' '}
            <div className={s.level}>{it.level}</div>
            <div className={s.overlay}>
              <div className={s.title}>{it.name}</div>
              {it.teacher && (
                <div
                  className={s.subtitle}
                  onClick={it.teacher.id ? (e) => goToTeacher(e, it.teacher.id) : undefined}
                >
                  {it.teacher.name}
                </div>
              )}
              {it.dateFrom && it.dateTo && (
                <div className={s.subtitle}>
                  {it.dateFrom} - {it.dateTo}
                </div>
              )}
              <div className={s.bottom}>
                {schedule && (
                  <div className={s.subtitle}>
                    {schedule.days}
                    {schedule.time && (
                      <>
                        {' '}
                        <span className={s.time}>{schedule.time}</span>
                      </>
                    )}
                  </div>
                )}
                {Boolean(it.price) && <div className={s.price}>{it.price.toLocaleString()} ₽</div>}
              </div>
            </div>
          </>
        );
      }}
    </CoverflowSwiper>
  );
};

export default Recommendations;
