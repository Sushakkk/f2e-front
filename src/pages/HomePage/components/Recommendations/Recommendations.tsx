import React, { useCallback } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
import { CoverflowSwiper } from 'components';
import { CourseConfigItem } from 'config';
import { RoutePath } from 'config/router/paths';
import type { RecommendationClient } from 'entities/recommendation';
import { getScheduleDisplay } from 'utils/scheduleUtils';

import s from './Recommendations.module.scss';

type Props = {
  items: CourseConfigItem[];
  recommendations?: RecommendationClient[];
};

export const Recommendations: React.FC<Props> = ({ items, recommendations }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const getImage = useCallback((it: CourseConfigItem) => it.images?.[0] || fallbackImage, []);
  const getKey = useCallback((it: CourseConfigItem) => it.id, []);
  const getAlt = useCallback((it: CourseConfigItem) => it.name, []);
  const reasonByCourseId = React.useMemo(
    () =>
      new Map(
        (recommendations ?? []).map((item) => [item.course.id, item.reasons[0] ?? ''])
      ),
    [recommendations]
  );

  const goToCourse = useCallback(
    (item: CourseConfigItem) => {
      if (item.id) {
        navigate(generatePath(RoutePath.course, { id: String(item.id) }), {
          state: {
            from: `${location.pathname}${location.search}`,
          },
        });
      }
    },
    [location.pathname, location.search, navigate]
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
              {it.teacher && <div className={s.subtitle}>{it.teacher.name}</div>}
              {reasonByCourseId.get(it.id) && (
                <div className={s.subtitle}>{reasonByCourseId.get(it.id)}</div>
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
