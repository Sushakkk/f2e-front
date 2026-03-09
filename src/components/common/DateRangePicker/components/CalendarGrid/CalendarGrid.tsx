import * as React from 'react';

import { addMonths, isSameDay, toIsoDate } from 'utils/dateUtils';
import { useCalendar } from 'utils/useCalendar';

import { WEEKDAY_LABELS } from '../../config';
import type { NormalizedRange } from '../../types';

import s from './CalendarGrid.module.scss';

type Props = {
  month: Date;
  normalized: NormalizedRange;
  onSetMonth: React.Dispatch<React.SetStateAction<Date>>;
  onPick: (date: Date) => void;
};

const CalendarGrid: React.FC<Props> = ({ month, normalized, onSetMonth, onPick }) => {
  const { monthLabel, days } = useCalendar(month);

  const handlePrevMonth = React.useCallback(
    () => onSetMonth((m) => addMonths(m, -1)),
    [onSetMonth]
  );

  const handleNextMonth = React.useCallback(() => onSetMonth((m) => addMonths(m, 1)), [onSetMonth]);

  return (
    <div className={s.root} role="dialog" aria-label="Выбор диапазона дат">
      <div className={s.header}>
        <button type="button" className={s.navBtn} onClick={handlePrevMonth}>
          ←
        </button>
        <div className={s.title}>{monthLabel}</div>
        <button type="button" className={s.navBtn} onClick={handleNextMonth}>
          →
        </button>
      </div>
      <div className={s.weekdays}>
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className={s.weekday}>
            {w}
          </div>
        ))}
      </div>
      <div className={s.grid}>
        {days.map((d, idx) => {
          if (!d) {
            return <div key={`e-${idx}`} className={s.empty} />;
          }

          const isStart = normalized.from ? isSameDay(d, normalized.from) : false;
          const isEnd = normalized.to ? isSameDay(d, normalized.to) : false;
          const inRange =
            normalized.from && normalized.to ? d >= normalized.from && d <= normalized.to : false;

          return (
            <button
              key={toIsoDate(d)}
              type="button"
              className={s.day}
              data-start={isStart}
              data-end={isEnd}
              data-inrange={inRange}
              onClick={() => onPick(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CalendarGrid);
