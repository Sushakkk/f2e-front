import * as React from 'react';

import { PICKER_ICONS, PICKER_LABELS } from './config';
import type { InputWithShowPicker, PickerInputProps } from './types';

import s from './PickerInput.module.scss';

export const PickerInput: React.FC<PickerInputProps> = ({ type, value, onChange }) => {
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

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange],
  );

  const handleInputPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (document.activeElement === ref.current) {
        e.preventDefault();
        e.stopPropagation();
        closePicker();
      }
    },
    [closePicker],
  );

  const handleInputClick = React.useCallback(() => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;

      return;
    }

    openPicker();
  }, [openPicker]);

  const handleBtnPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (document.activeElement === ref.current) {
        e.preventDefault();
        e.stopPropagation();
        closePicker();

        return;
      }

      e.preventDefault();
    },
    [closePicker],
  );

  const handleBtnClick = React.useCallback(() => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;

      return;
    }

    openPicker();
  }, [openPicker]);

  return (
    <div className={s.field}>
      <input
        ref={ref}
        type={type}
        className={`${s.input} ${s.pickerInput}`}
        value={value}
        onChange={handleChange}
        onPointerDown={handleInputPointerDown}
        onClick={handleInputClick}
      />
      <button
        type="button"
        className={s.btn}
        onPointerDown={handleBtnPointerDown}
        onClick={handleBtnClick}
        aria-label={PICKER_LABELS[type]}
      >
        {PICKER_ICONS[type]}
      </button>
    </div>
  );
};

export default React.memo(PickerInput);
