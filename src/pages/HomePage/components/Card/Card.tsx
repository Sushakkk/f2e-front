import cn from 'classnames';
import * as React from 'react';

import { CourseConfigItem } from 'pages/HomePage/config/cards';
import { formatCourseLevel } from 'pages/HomePage/config/levels';

import s from './Card.module.scss';

type Props = {
  className?: string;
  item: CourseConfigItem;
  onClick?: (id: number) => void;
};

const Card: React.FC<Props> = ({ className, item, onClick }) => {
  const { title, teacher, level, dateFrom, dateTo, price, image, id } = item;

  return (
    <div className={cn(s.card, className)} onClick={() => onClick?.(id)} role="button">
      <div className={s.imageWrapper}>
        <img src={image} alt={title} />
      </div>
      <div className={s.level}>{formatCourseLevel(level)}</div>
      <div className={s.content}>
        <div className={s.title}>{title}</div>
        {teacher && <div className={s.subtitle}>{teacher}</div>}
        <div className={s.container}>
          {dateFrom && dateTo && (
            <div className={s.subtitle}>
              {dateFrom} - {dateTo}
            </div>
          )}
          {price && <div className={s.price}>{price.toLocaleString()} ₽</div>}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Card);
