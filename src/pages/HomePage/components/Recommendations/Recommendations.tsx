import React, { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { CoverflowSwiper } from 'components';
import { CourseConfigItem, formatCourseLevel } from 'config';
import { RoutePath } from 'config/router/paths';
import { getScheduleDisplay } from 'utils/scheduleUtils';

import s from './Recommendations.module.scss';

type Props = {
  items: CourseConfigItem[];
};

export const Recommendations: React.FC<Props> = ({ items }) => {
  const navigate = useNavigate();

  const goToCourse = useCallback(
    (item: CourseConfigItem) => {
      if (item.id) {
        navigate(generatePath(RoutePath.course, { id: String(item.id) }));
      }
    },
    [navigate]
  );

  return (
    <CoverflowSwiper
      items={items}
      getImage={(it: CourseConfigItem) => it.images?.[0]}
      getKey={(it: CourseConfigItem) => it.id}
      getAlt={(it: CourseConfigItem) => it.name}
      onItemClick={goToCourse}
    >
      {(it: CourseConfigItem) => {
        const schedule = getScheduleDisplay(it);

        return (
          <>
            {' '}
            <div className={s.level}>{formatCourseLevel(it.level)}</div>
            <div className={s.overlay}>
              <div className={s.title}>{it.name}</div>
              {it.teacher && <div className={s.subtitle}>{it.teacher.name}</div>}
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
