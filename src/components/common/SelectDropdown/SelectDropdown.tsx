import * as React from 'react';

import s from './SelectDropdown.module.scss';
import { SelectMenu, SelectTrigger } from './components';
import type { SelectDropdownProps } from './types';
import { useClickOutside } from 'utils/useClickOutside';

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

const SelectDropdown: React.FC<SelectDropdownProps> = (props) => {
  const { options, placeholder = 'Выбрать', searchable } = props;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const close = React.useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close);

  const isMulti = props.mode === 'multi';
  const selectedValues = isMulti ? props.value : props.value ? [props.value] : [];

  const labelByValue = React.useMemo(() => {
    const map = new Map<string, string>();

    options.forEach((o) => map.set(o.value, o.label));

    return map;
  }, [options]);

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
  }, [isMulti, labelByValue, props]);

  const filteredOptions = React.useMemo(() => {
    const q = (isMulti ? query : props.value).trim();

    if (!searchable || !q) return options;

    return options.filter(
      (o) => includesInsensitive(o.label, q) || includesInsensitive(o.value, q),
    );
  }, [isMulti, options, props.value, query, searchable]);

  const handleSelect = React.useCallback(
    (v: string) => {
      if (isMulti) {
        const next = new Set(props.value);

        if (next.has(v)) {
          next.delete(v);
        } else {
          next.add(v);
        }

        props.onChange(uniq(Array.from(next)));
      } else {
        props.onChange(v);
        setOpen(false);
      }
    },
    [isMulti, props],
  );

  const handleClear = React.useCallback(() => {
    if (isMulti) {
      props.onChange([]);
    }
  }, [isMulti, props]);

  const handleToggle = React.useCallback(() => {
    if (isMulti) setQuery('');

    setOpen((v) => {
      const next = !v;

      if (!next) {
        requestAnimationFrame(() => btnRef.current?.blur());
      }

      return next;
    });
  }, [isMulti]);

  const handleInputMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (open) {
        e.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => inputRef.current?.blur());
      }
    },
    [open],
  );

  const handleInputFocus = React.useCallback(() => {
    setOpen(true);
    if (isMulti) setQuery('');
  }, [isMulti]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isMulti) {
        setQuery(e.target.value);
      } else {
        props.onChange(e.target.value);
      }

      setOpen(true);
    },
    [isMulti, props],
  );

  const triggerDisplayValue = isMulti ? (open ? query : summary) : props.value;
  const triggerPlaceholder = isMulti
    ? open
      ? summary || placeholder
      : placeholder
    : placeholder;

  return (
    <div ref={rootRef} className={s.root}>
      {searchable ? (
        <SelectTrigger
          variant="input"
          open={open}
          displayValue={triggerDisplayValue}
          placeholder={triggerPlaceholder}
          inputRef={inputRef}
          onMouseDown={handleInputMouseDown}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
        />
      ) : (
        <SelectTrigger
          variant="button"
          open={open}
          summary={summary}
          placeholder={placeholder}
          btnRef={btnRef}
          onToggle={handleToggle}
        />
      )}

      {open && (
        <SelectMenu
          isMulti={isMulti}
          options={filteredOptions}
          selectedValues={selectedValues}
          clearLabel={isMulti ? (props as { clearLabel?: string }).clearLabel ?? placeholder : undefined}
          onClear={isMulti ? handleClear : undefined}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default React.memo(SelectDropdown);
