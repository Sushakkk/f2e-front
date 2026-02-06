import * as React from 'react';

import s from './SearchBar.module.scss';
import FilterIcon from './img/filter.svg?react';
import SearchIcon from './img/search.svg?react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  // onOpenFilters: () => void;
};

const SearchBar: React.FC<Props> = ({ value, onChange }) => {
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
          placeholder="Search"
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
      <FilterIcon
        className={s.filtersBtn}
        type="button"
        // onClick={onOpenFilters}
        aria-label="Открыть фильтры"
      />
    </div>
  );
};

export default React.memo(SearchBar);
