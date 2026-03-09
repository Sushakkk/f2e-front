import cn from 'classnames';
import * as React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { CourseConfigItem } from 'config';
import { RoutePath } from 'config/router/paths';
import { getScheduleDisplay } from 'utils/scheduleUtils';

import s from './Card.module.scss';

type Props = {
  className?: string;
  item: CourseConfigItem;
  badgeLabel?: string;
  badgeClassName?: string;
  compact?: boolean;
  profile?: boolean;
  largeImage?: boolean;
  statusLabel?: string;
  actions?: React.ReactNode;
};

const Card: React.FC<Props> = ({
  className,
  item,
  badgeLabel,
  badgeClassName,
  compact,
  profile,
  largeImage,
  statusLabel,
  actions,
}) => {
  const { name, teacher, level, dateFrom, dateTo, price, images, id } = item;
  const navigate = useNavigate();

  const schedule = React.useMemo(() => getScheduleDisplay(item), [item]);

  const goToCourse = React.useCallback(() => {
    if (id) {
      navigate(generatePath(RoutePath.course, { id: String(id) }));
    }
  }, [navigate, id]);

  return (
    <div
      className={cn(
        s.card,
        compact && s.card_compact,
        profile && s.card_profile,
        largeImage && s.card_largeImage,
        className
      )}
      onClick={goToCourse}
    >
      <div className={s.imageWrapper}>
        <img src={images[0]} alt={name} />
      </div>
      <div className={cn(s.level, badgeClassName)}>{badgeLabel ?? level}</div>
      <div className={s.content}>
        <div className={s.title}>
          {name}
          {statusLabel && <span className={s.statusLabel}> · {statusLabel}</span>}
        </div>
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
        {actions && (
          <div className={s.actions} onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Card);
