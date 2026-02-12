import * as React from 'react';

import { startOfMonth } from './dateUtils';

type UseCalendarReturn = {
  monthLabel: string;
  days: Array<Date | null>;
};

export function useCalendar(month: Date): UseCalendarReturn {
  const monthLabel = React.useMemo(() => {
    return month.toLocaleString('ru', { month: 'long', year: 'numeric' });
  }, [month]);

  const days = React.useMemo(() => {
    const first = startOfMonth(month);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;

    const cells: Array<Date | null> = [];

    for (let i = 0; i < offset; i += 1) cells.push(null);

    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    }

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [month]);

  return { monthLabel, days };
}
