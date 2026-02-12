import * as React from 'react';

import s from './SelectOption.module.scss';

type Props = {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

const SelectOption: React.FC<Props> = ({ label, selected, onClick, disabled }) => {
  return (
    <button
      type="button"
      className={s.item}
      data-selected={selected}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={s.check} aria-hidden="true">
        {selected ? '✓' : ''}
      </span>
      {label}
    </button>
  );
};

export default React.memo(SelectOption);
