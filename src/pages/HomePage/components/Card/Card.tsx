import cn from 'classnames';
import * as React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { CourseConfigItem, formatCourseLevel } from 'config';
import { RoutePath } from 'config/router/paths';
import { getScheduleDisplay } from 'utils/scheduleUtils';

import s from './Card.module.scss';

type Props = {
  className?: string;
  item: CourseConfigItem;
};

const Card: React.FC<Props> = ({ className, item }) => {
  const { name, teacher, level, dateFrom, dateTo, price, images, id } = item;
  const navigate = useNavigate();

  const schedule = React.useMemo(() => getScheduleDisplay(item), [item]);

  const goToCourse = React.useCallback(() => {
    if (id) {
      navigate(generatePath(RoutePath.course, { id: String(id) }));
    }
  }, [navigate, id]);

  return (
    <div className={cn(s.card, className)} onClick={goToCourse}>
      <div className={s.imageWrapper}>
        <img src={images[0]} alt={name} />
      </div>
      <div className={s.level}>{formatCourseLevel(level)}</div>
      <div className={s.content}>
        <div className={s.title}>{name}</div>
        {teacher && <div className={s.subtitle}>{teacher.name}</div>}
        {dateFrom && dateTo && (
          <div className={s.subtitle}>
            {dateFrom} - {dateTo}
          </div>
        )}
        <div className={s.container}>
          {schedule && (
            <div className={s.schedule}>
              {schedule.days} &ensp;<span className={s.time}>{schedule.time}</span>
            </div>
          )}
          {price && <div className={s.price}>{price.toLocaleString()} ₽</div>}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Card);
