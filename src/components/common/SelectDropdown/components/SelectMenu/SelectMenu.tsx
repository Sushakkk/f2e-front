import * as React from 'react';
import cn from 'classnames';

import type { SelectOption as SelectOptionType } from '../../types';
import { SelectOption } from '../SelectOption';

import s from './SelectMenu.module.scss';

type Props = {
  isMulti: boolean;
  options: SelectOptionType[];
  selectedValues: string[];
  direction?: 'down' | 'up';
  clearLabel?: string;
  onClear?: () => void;
  onSelect: (value: string) => void;
};

const SelectMenu: React.FC<Props> = ({
  isMulti,
  options,
  selectedValues,
  direction = 'down',
  clearLabel,
  onClear,
  onSelect,
}) => {
  return (
    <div
      className={cn(s.menu, direction === 'up' && s.menu_up)}
      role="listbox"
      aria-multiselectable={isMulti || undefined}
    >
      {isMulti && onClear && (
        <SelectOption
          label={clearLabel ?? 'Сбросить'}
          selected={selectedValues.length === 0}
          onClick={onClear}
        />
      )}
      {options.map((o) => (
        <SelectOption
          key={o.value}
          label={o.label}
          selected={selectedValues.includes(o.value)}
          onClick={() => onSelect(o.value)}
        />
      ))}
      {options.length === 0 && (
        <SelectOption label="Ничего не найдено" selected={false} onClick={() => {}} disabled />
      )}
    </div>
  );
};

export default React.memo(SelectMenu);
