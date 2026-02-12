import * as React from 'react';

import s from './Filters.module.scss';

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromIsoDate(value: string): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
}

function formatRu(value: string) {
  const d = fromIsoDate(value);
  if (!d) return '';
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function clampRange(from: Date | null, to: Date | null) {
  if (!from || !to) return { from, to };
  if (to < from) return { from: to, to: from };
  return { from, to };
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const DateRangePicker: React.FC<Props> = ({ from, to, onChange }) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const fromBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const toBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<'from' | 'to'>('from');

  const fromDate = React.useMemo(() => fromIsoDate(from), [from]);
  const toDate = React.useMemo(() => fromIsoDate(to), [to]);
  const normalized = React.useMemo(() => clampRange(fromDate, toDate), [fromDate, toDate]);

  const [month, setMonth] = React.useState(() => startOfMonth(fromDate ?? toDate ?? new Date()));

  React.useEffect(() => {
    if (!open) return;
    setMonth(startOfMonth((active === 'from' ? fromDate : toDate) ?? fromDate ?? toDate ?? new Date()));
  }, [open, active, fromDate, toDate]);

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (open) return;
    requestAnimationFrame(() => {
      fromBtnRef.current?.blur();
      toBtnRef.current?.blur();
    });
  }, [open]);

  const onPick = React.useCallback(
    (picked: Date) => {
      if (active === 'from') {
        const nextFrom = picked;
        const nextTo = normalized.to && normalized.to < nextFrom ? null : normalized.to;
        onChange({ from: toIsoDate(nextFrom), to: nextTo ? toIsoDate(nextTo) : '' });
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
      onChange({ from: next.from ? toIsoDate(next.from) : '', to: next.to ? toIsoDate(next.to) : '' });
      requestAnimationFrame(() => toBtnRef.current?.blur());
    },
    [active, normalized.from, normalized.to, onChange]
  );

  const monthLabel = React.useMemo(() => {
    return month.toLocaleString('ru', { month: 'long', year: 'numeric' });
  }, [month]);

  const days = React.useMemo(() => {
    const first = startOfMonth(month);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;

    const cells: Array<Date | null> = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  return (
    <div ref={rootRef} className={s.dateRangePicker}>
      <div className={s.dateRangeRow}>
        <div className={s.rangeInline}>
          <span className={s.rangeInlineLabel}>с</span>
          <button
            ref={fromBtnRef}
            type="button"
            className={s.rangeBtn}
            data-active={open && active === 'from'}
            onClick={() => {
              if (open && active === 'from') {
                setOpen(false);
                requestAnimationFrame(() => fromBtnRef.current?.blur());
                return;
              }
              setActive('from');
              setOpen(true);
            }}
          >
            <span className={s.rangeValue}>{formatRu(from) || 'ДД.ММ.ГГГГ'}</span>
            <span className={s.rangeIcon} aria-hidden="true">
              {calendarSvg}
            </span>
          </button>
        </div>
        <div className={s.rangeInline}>
          <span className={s.rangeInlineLabel}>по</span>
          <button
            ref={toBtnRef}
            type="button"
            className={s.rangeBtn}
            data-active={open && active === 'to'}
            onClick={() => {
              if (open && active === 'to') {
                setOpen(false);
                requestAnimationFrame(() => toBtnRef.current?.blur());
                return;
              }
              setActive('to');
              setOpen(true);
            }}
          >
            <span className={s.rangeValue}>{formatRu(to) || 'ДД.ММ.ГГГГ'}</span>
            <span className={s.rangeIcon} aria-hidden="true">
              {calendarSvg}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className={s.calendar} role="dialog" aria-label="Выбор диапазона дат">
          <div className={s.calendarHeader}>
            <button type="button" className={s.calNavBtn} onClick={() => setMonth((m) => addMonths(m, -1))}>
              ←
            </button>
            <div className={s.calTitle}>{monthLabel}</div>
            <button type="button" className={s.calNavBtn} onClick={() => setMonth((m) => addMonths(m, 1))}>
              →
            </button>
          </div>

          <div className={s.calWeekdays}>
            {WEEKDAYS.map((w) => (
              <div key={w} className={s.calWeekday}>
                {w}
              </div>
            ))}
          </div>

          <div className={s.calGrid}>
            {days.map((d, idx) => {
              if (!d) {
                return <div key={`e-${idx}`} className={s.calEmpty} />;
              }

              const isStart = normalized.from ? isSameDay(d, normalized.from) : false;
              const isEnd = normalized.to ? isSameDay(d, normalized.to) : false;
              const inRange =
                normalized.from && normalized.to ? d >= normalized.from && d <= normalized.to : false;

              return (
                <button
                  key={toIsoDate(d)}
                  type="button"
                  className={s.calDay}
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
      )}
    </div>
  );
};

const calendarSvg = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default React.memo(DateRangePicker);

