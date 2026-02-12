import * as React from 'react';

import s from './Filters.module.scss';

type Props = {
  type: 'date' | 'time';
  value: string;
  onChange: (v: string) => void;
};

type InputWithShowPicker = HTMLInputElement & { showPicker?: () => void };

export const PickerInput: React.FC<Props> = ({ type, value, onChange }) => {
  const ref = React.useRef<HTMLInputElement | null>(null);
  const suppressNextClickRef = React.useRef(false);

  const openPicker = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const maybeShowPicker = (el as InputWithShowPicker).showPicker;
    if (maybeShowPicker) {
      maybeShowPicker.call(el);
      return;
    }
    el.focus();
    el.click();
  }, []);

  const closePicker = React.useCallback(() => {
    suppressNextClickRef.current = true;
    ref.current?.blur();
    window.setTimeout(() => {
      suppressNextClickRef.current = false;
    }, 0);
  }, []);

  return (
    <div className={s.pickerField}>
      <input
        ref={ref}
        type={type}
        className={`${s.input} ${s.pickerInput}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPointerDown={(e) => {
          if (document.activeElement === ref.current) {
            e.preventDefault();
            e.stopPropagation();
            closePicker();
          }
        }}
        onClick={() => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
          }
          openPicker();
        }}
      />
      <button
        type="button"
        className={s.pickerBtn}
        onPointerDown={(e) => {
          if (document.activeElement === ref.current) {
            e.preventDefault();
            e.stopPropagation();
            closePicker();
            return;
          }
          e.preventDefault();
        }}
        onClick={() => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
          }
          openPicker();
        }}
        aria-label={type === 'date' ? 'Выбрать дату' : 'Выбрать время'}
      >
        {type === 'date' ? calendarSvg : clockSvg}
      </button>
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

const clockSvg = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);

export default React.memo(PickerInput);

