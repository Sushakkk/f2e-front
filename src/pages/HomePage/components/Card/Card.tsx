import cn from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { CourseConfigItem } from 'pages/HomePage/config/cards';
import { formatCourseLevel } from 'pages/HomePage/config/levels';
import { getScheduleDisplay } from 'utils/scheduleUtils';

import s from './Card.module.scss';

type Props = {
  className?: string;
  item: CourseConfigItem;
};

const Card: React.FC<Props> = ({ className, item }) => {
  const { name, teacher, level, dateFrom, dateTo, price, image, id } = item;

  const schedule = React.useMemo(() => getScheduleDisplay(item), [item]);

  return (
    <Link to={`/course/${id}`} className={cn(s.card, className)}>
      <div className={s.imageWrapper}>
        <img src={image} alt={name} />
      </div>
      <div className={s.level}>{formatCourseLevel(level)}</div>
      <div className={s.content}>
        <div className={s.title}>{name}</div>
        {teacher && <div className={s.subtitle}>{teacher}</div>}
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
    </Link>
  );
};

export default React.memo(Card);
