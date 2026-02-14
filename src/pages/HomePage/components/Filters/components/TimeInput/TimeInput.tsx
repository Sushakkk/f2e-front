import * as React from 'react';

import s from './TimeInput.module.scss';

type TimeInputProps = {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
};

function formatTimeValue(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function clampTime(value: string): string {
  const match = value.match(/^(\d{1,2}):?(\d{0,2})$/);

  if (!match) {
    return value;
  }

  const hours = Math.min(Number(match[1]), 23);
  const minutes = match[2] ? Math.min(Number(match[2]), 59) : undefined;

  const hh = String(hours).padStart(2, '0');

  if (minutes === undefined) {
    return hh;
  }

  return `${hh}:${String(minutes).padStart(2, '0')}`;
}

export const TimeInput: React.FC<TimeInputProps> = ({ value, placeholder = 'ЧЧ:ММ', onChange }) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTimeValue(e.target.value);

      setLocalValue(formatted);

      if (formatted.length === 5) {
        onChange(clampTime(formatted));
      } else if (formatted === '') {
        onChange('');
      }
    },
    [onChange]
  );

  const handleBlur = React.useCallback(() => {
    if (localValue === '') {
      onChange('');

      return;
    }

    const clamped = clampTime(localValue);

    if (clamped.length === 5) {
      setLocalValue(clamped);
      onChange(clamped);
    } else if (clamped.length >= 1) {
      const padded = clampTime(`${clamped}:00`);

      setLocalValue(padded);
      onChange(padded);
    }
  }, [localValue, onChange]);

  const handleClear = React.useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className={s.field}>
      <input
        type="text"
        inputMode="numeric"
        className={`${s.input}${value ? ` ${s.hasValue}` : ''}`}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={5}
      />
      {value && (
        <button
          type="button"
          className={s.clearBtn}
          onClick={handleClear}
          aria-label="Очистить время"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default React.memo(TimeInput);
