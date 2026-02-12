import * as React from 'react';

import s from './SearchBar.module.scss';
import FilterIcon from './img/filter.svg?react';
import SearchIcon from './img/search.svg?react';

export type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  onToggleFilters?: () => void;
  isFiltersOpen?: boolean;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onToggleFilters,
  isFiltersOpen,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClear = React.useCallback(() => {
    onChange('');
    // keep UX snappy: return focus to the input
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className={s.root}>
      <div className={s.inputWrap}>
        <SearchIcon className={s.searchIcon} />
        <input
          ref={inputRef}
          className={s.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
              ×
            </span>
          </button>
        )}
      </div>
      {onToggleFilters && (
        <button
          className={s.filtersBtn}
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
