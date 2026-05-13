import cn from 'classnames';
import * as React from 'react';

import { useClickOutside } from 'utils/useClickOutside';

import s from './SearchBar.module.scss';
import FilterIcon from './img/filter.svg?react';
import SearchIcon from './img/search.svg?react';

export type SearchSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
};

export type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  onToggleFilters?: () => void;
  isFiltersOpen?: boolean;
  className?: string;
  filtersAlwaysVisible?: boolean;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onToggleFilters,
  isFiltersOpen,
  className,
  filtersAlwaysVisible,
  suggestions = [],
  onSuggestionSelect,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  useClickOutside(rootRef, () => setIsFocused(false));

  const onClear = React.useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const shouldShowSuggestions =
    Boolean(onSuggestionSelect) && isFocused && value.trim().length > 0 && suggestions.length > 0;

  const handleSuggestionSelect = React.useCallback(
    (suggestion: SearchSuggestion) => {
      onSuggestionSelect?.(suggestion);
      setIsFocused(false);
    },
    [onSuggestionSelect]
  );

  return (
    <div ref={rootRef} className={cn(s.root, className)}>
      <div className={s.inputWrap}>
        <SearchIcon className={s.searchIcon} />
        <input
          ref={inputRef}
          className={s.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
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
        {shouldShowSuggestions && (
          <div className={s.suggestions} role="listbox" aria-label="Подходящие студии">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className={s.suggestion}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <span className={s.suggestionTitle}>{suggestion.title}</span>
                {suggestion.subtitle && (
                  <span className={s.suggestionSubtitle}>{suggestion.subtitle}</span>
                )}
              </button>
            ))}
          </div>
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
