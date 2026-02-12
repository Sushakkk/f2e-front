import * as React from 'react';

import { clampRange, fromIsoDate, startOfMonth, toIsoDate } from 'utils/dateUtils';

import s from './DateRangePicker.module.scss';
import { CalendarGrid, RangeTrigger } from './components';
import type { ActiveField, DateRangeValue } from './types';

type Props = {
  from: string;
  to: string;
  onChange: (next: DateRangeValue) => void;
};

export const DateRangePicker: React.FC<Props> = ({ from, to, onChange }) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const fromBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const toBtnRef = React.useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<ActiveField>('from');

  const fromDate = React.useMemo(() => fromIsoDate(from), [from]);
  const toDate = React.useMemo(() => fromIsoDate(to), [to]);
  const normalized = React.useMemo(() => clampRange(fromDate, toDate), [fromDate, toDate]);

  const [month, setMonth] = React.useState(() => startOfMonth(fromDate ?? toDate ?? new Date()));

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setMonth(
      startOfMonth((active === 'from' ? fromDate : toDate) ?? fromDate ?? toDate ?? new Date())
    );
  }, [open, active, fromDate, toDate]);

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;

      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onDocKeyDown);

    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      return;
    }

    requestAnimationFrame(() => {
      fromBtnRef.current?.blur();
      toBtnRef.current?.blur();
    });
  }, [open]);

  const toggleField = React.useCallback(
    (field: ActiveField) => {
      if (open && active === field) {
        setOpen(false);
        const ref = field === 'from' ? fromBtnRef : toBtnRef;

        requestAnimationFrame(() => ref.current?.blur());

        return;
      }

      setActive(field);
      setOpen(true);
    },
    [open, active]
  );

  const onPick = React.useCallback(
    (picked: Date) => {
      if (active === 'from') {
        const nextTo = normalized.to && normalized.to < picked ? null : normalized.to;

        onChange({ from: toIsoDate(picked), to: nextTo ? toIsoDate(nextTo) : '' });
        setActive('to');
        requestAnimationFrame(() => fromBtnRef.current?.blur());

        return;
      }

      if (!normalized.from) {
        onChange({ from: toIsoDate(picked), to: '' });
        setActive('to');
        requestAnimationFrame(() => toBtnRef.current?.blur());

        return;
      }

      const next = clampRange(normalized.from, picked);

      onChange({
        from: next.from ? toIsoDate(next.from) : '',
        to: next.to ? toIsoDate(next.to) : '',
      });
      requestAnimationFrame(() => toBtnRef.current?.blur());
    },
    [active, normalized.from, normalized.to, onChange]
  );

  return (
    <div ref={rootRef} className={s.root}>
      <RangeTrigger
        from={from}
        to={to}
        open={open}
        active={active}
        fromBtnRef={fromBtnRef}
        toBtnRef={toBtnRef}
        onToggle={toggleField}
      />
      {open && (
        <CalendarGrid month={month} normalized={normalized} onSetMonth={setMonth} onPick={onPick} />
      )}
    </div>
  );
};

export default React.memo(DateRangePicker);
