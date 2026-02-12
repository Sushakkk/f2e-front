import * as React from 'react';

import s from './Filters.module.scss';

export type SelectOption = { value: string; label: string };

type BaseProps = {
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
};

type SingleProps = BaseProps & {
  mode?: 'single';
  value: string;
  onChange: (v: string) => void;
  allowCustomValue?: boolean;
};

type MultiProps = BaseProps & {
  mode: 'multi';
  value: string[];
  onChange: (v: string[]) => void;
  clearLabel?: string;
};

export type SelectDropdownProps = SingleProps | MultiProps;

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

function includesInsensitive(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export const SelectDropdown: React.FC<SelectDropdownProps> = (props) => {
  const { options, placeholder = 'Выбрать', searchable } = props;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const labelByValue = React.useMemo(() => {
    const map = new Map<string, string>();
    options.forEach((o) => map.set(o.value, o.label));
    return map;
  }, [options]);

  const isMulti = props.mode === 'multi';
  const selectedValues = isMulti ? props.value : props.value ? [props.value] : [];

  const summary = React.useMemo(() => {
    if (!isMulti) {
      return props.value || '';
    }

    if (props.value.length === 0) return '';
    if (props.value.length === 1) return labelByValue.get(props.value[0]) ?? '1 выбран';
    if (props.value.length <= 3) {
      return props.value
        .map((v) => labelByValue.get(v) ?? v)
        .filter(Boolean)
        .join(', ');
    }
    return `${props.value.length} выбрано`;
  }, [isMulti, labelByValue, placeholder, props]);

  const filteredOptions = React.useMemo(() => {
    const q = (isMulti ? query : props.value).trim();
    if (!searchable || !q) return options;
    return options.filter((o) => includesInsensitive(o.label, q) || includesInsensitive(o.value, q));
  }, [isMulti, options, props.value, query, searchable]);

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, []);

  const toggleMultiValue = React.useCallback(
    (v: string) => {
      if (!isMulti) return;
      const next = new Set(props.value);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      props.onChange(uniq(Array.from(next)));
    },
    [isMulti, props]
  );

  const onPickSingle = React.useCallback(
    (v: string) => {
      if (isMulti) return;
      props.onChange(v);
      setOpen(false);
    },
    [isMulti, props]
  );

  return (
    <div ref={rootRef} className={s.selectRoot}>
      {searchable ? (
        <div className={s.selectInputWrap}>
          <input
            ref={inputRef}
            type="text"
            className={s.selectInput}
            placeholder={
              isMulti ? (open ? summary || placeholder : placeholder) : placeholder
            }
            value={isMulti ? (open ? query : summary) : props.value}
            onMouseDown={(e) => {
              if (open) {
                e.preventDefault();
                setOpen(false);
                requestAnimationFrame(() => inputRef.current?.blur());
              }
            }}
            onFocus={() => {
              setOpen(true);
              if (isMulti) setQuery('');
            }}
            onChange={(e) => {
              if (isMulti) {
                setQuery(e.target.value);
                setOpen(true);
              } else {
                props.onChange(e.target.value);
                setOpen(true);
              }
            }}
          />
          <span className={s.selectInputCaret} aria-hidden="true">
            ▾
          </span>
        </div>
      ) : (
        <button
          ref={btnRef}
          type="button"
          className={s.selectBtn}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => {
            if (isMulti) setQuery('');
            setOpen((v) => {
              const next = !v;
              if (!next) {
                requestAnimationFrame(() => btnRef.current?.blur());
              }
              return next;
            });
          }}
        >
          <span className={s.selectValue}>{summary || placeholder}</span>
          <span className={s.selectCaret} aria-hidden="true">
            ▾
          </span>
        </button>
      )}

      {open && (
        <div className={s.selectMenu} role="listbox" aria-multiselectable={isMulti || undefined}>
          {isMulti && (
            <button
              type="button"
              className={s.selectItem}
              data-selected={selectedValues.length === 0}
              onClick={() => props.onChange([])}
            >
              <span className={s.selectCheck} aria-hidden="true">
                {selectedValues.length === 0 ? '✓' : ''}
              </span>
              {(props.clearLabel ?? placeholder) || 'Сбросить'}
            </button>
          )}

          {filteredOptions.map((o) => {
            const selected = selectedValues.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                className={s.selectItem}
                data-selected={selected}
                onClick={() => (isMulti ? toggleMultiValue(o.value) : onPickSingle(o.value))}
              >
                <span className={s.selectCheck} aria-hidden="true">
                  {selected ? '✓' : ''}
                </span>
                {o.label}
              </button>
            );
          })}

          {filteredOptions.length === 0 && (
            <button type="button" className={s.selectItem} disabled>
              Ничего не найдено
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SelectDropdown);

