import cn from 'classnames';
import * as React from 'react';

import s from './SearchBar.module.scss';
import FilterIcon from './img/filter.svg?react';
import SearchIcon from './img/search.svg?react';

export type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  onToggleFilters?: () => void;
  isFiltersOpen?: boolean;
  className?: string;
  filtersAlwaysVisible?: boolean;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  onToggleFilters,
  isFiltersOpen,
  className,
  filtersAlwaysVisible,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClear = React.useCallback(() => {
    onChange('');
    onSubmit?.();
    inputRef.current?.focus();
  }, [onChange, onSubmit]);

  return (
    <div className={cn(s.root, className)}>
      <div className={s.inputWrap}>
        <SearchIcon className={s.searchIcon} />
        <input
          ref={inputRef}
          className={s.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit?.();
            }
          }}
          placeholder="Поиск"
        />
        {value.length > 0 && (
          <button
            className={s.clearBtn}
            type="button"
            aria-label="Очистить поиск"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
          >
            <span className={s.clearIcon} aria-hidden="true">
              x
            </span>
          </button>
        )}
      </div>
      {onToggleFilters && (
        <button
          className={cn(s.filtersBtn, filtersAlwaysVisible && s.filtersBtnVisible)}
          type="button"
          onClick={onToggleFilters}
          aria-label="Открыть фильтры"
          aria-expanded={isFiltersOpen}
        >
          <FilterIcon aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
