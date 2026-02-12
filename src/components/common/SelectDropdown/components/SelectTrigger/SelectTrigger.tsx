import * as React from 'react';

import s from './SelectTrigger.module.scss';

type ButtonTriggerProps = {
  variant: 'button';
  open: boolean;
  summary: string;
  placeholder: string;
  btnRef: React.Ref<HTMLButtonElement>;
  onToggle: () => void;
};

type InputTriggerProps = {
  variant: 'input';
  open: boolean;
  displayValue: string;
  placeholder: string;
  inputRef: React.Ref<HTMLInputElement>;
  onMouseDown: (e: React.MouseEvent) => void;
  onFocus: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type Props = ButtonTriggerProps | InputTriggerProps;

const SelectTrigger: React.FC<Props> = (props) => {
  if (props.variant === 'input') {
    return (
      <div className={s.inputWrap}>
        <input
          ref={props.inputRef}
          type="text"
          className={s.input}
          placeholder={props.placeholder}
          value={props.displayValue}
          onMouseDown={props.onMouseDown}
          onFocus={props.onFocus}
          onChange={props.onChange}
        />
        <span className={s.inputCaret} aria-hidden="true">
          ▾
        </span>
      </div>
    );
  }

  return (
    <button
      ref={props.btnRef}
      type="button"
      className={s.btn}
      aria-expanded={props.open}
      aria-haspopup="listbox"
      onClick={props.onToggle}
    >
      <span className={s.btnValue}>{props.summary || props.placeholder}</span>
      <span className={s.btnCaret} aria-hidden="true">
        ▾
      </span>
    </button>
  );
};

export default React.memo(SelectTrigger);
