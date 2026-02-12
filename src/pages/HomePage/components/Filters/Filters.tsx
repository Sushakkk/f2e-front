import { observer } from 'mobx-react';
import * as React from 'react';

import { Button } from 'components/common';
import { SelectDropdown } from 'components/common/SelectDropdown';
import { FiltersStore } from 'store/FiltersStore';

import s from './Filters.module.scss';
import { DateRangePicker } from './components/DateRangePicker';
import { PickerInput } from './components/PickerInput';
import type { CoursesFiltersValue } from './types';

type Props = {
  store: FiltersStore;
  onClose?: () => void;
};

const Filters: React.FC<Props> = observer(({ store, onClose }) => {
  const { draft } = store;

  const handleToggleTitle = React.useCallback((t: string) => store.toggleTitle(t), [store]);

  const handleLevelsChange = React.useCallback((next: string[]) => store.setLevels(next), [store]);

  const handleDateRangeChange = React.useCallback(
    ({ from, to }: { from: string; to: string }) => store.setDateRange(from, to),
    [store]
  );

  const handleTimeFromChange = React.useCallback((v: string) => store.setTimeFrom(v), [store]);

  const handleTimeToChange = React.useCallback((v: string) => store.setTimeTo(v), [store]);

  const handleWeekdaysChange = React.useCallback(
    (next: string[]) => store.setWeekdays(next),
    [store]
  );

  const handleTeachersChange = React.useCallback((v: string[]) => store.setTeachers(v), [store]);

  const handleStudiosChange = React.useCallback((v: string[]) => store.setStudios(v), [store]);

  const handlePriceFromChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => store.setPriceFrom(e.target.value),
    [store]
  );

  const handlePriceToChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => store.setPriceTo(e.target.value),
    [store]
  );

  const handleReset = React.useCallback(() => store.reset(), [store]);

  const handleSubmit = React.useCallback(() => store.submit(), [store]);

  return (
    <div className={s.root}>
      <div className={s.header}>
        <div className={s.headerTitle}>Фильтры</div>
        {onClose && (
          <button
            type="button"
            className={s.closeBtn}
            onClick={onClose}
            aria-label="Закрыть фильтры"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      <div className={s.section}>
        <label className={s.label}>Тип танца</label>
        <div className={s.options}>
          {store.titleOptions.map((t) => (
            <button
              key={t}
              type="button"
              className={s.optionBtn}
              data-active={draft.titles.includes(t)}
              onClick={() => handleToggleTitle(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className={s.section}>
        <label className={s.label}>Уровень подготовки</label>
        <SelectDropdown
          mode="multi"
          value={draft.levels}
          placeholder="Выберите уровень"
          options={store.levelOptions}
          onChange={handleLevelsChange}
          searchable
        />
      </div>
      <div className={s.section}>
        <label className={s.label}>Дата и время</label>
        <div className={s.row}>
          <DateRangePicker
            from={draft.dateFrom}
            to={draft.dateTo}
            onChange={handleDateRangeChange}
          />
          <div className={s.timeRange}>
            <div className={s.rangeInline}>
              <span className={s.rangeInlineLabel}>с</span>
              <div className={s.rangeInlineField}>
                <PickerInput type="time" value={draft.timeFrom} onChange={handleTimeFromChange} />
              </div>
            </div>
            <div className={s.rangeInline}>
              <span className={s.rangeInlineLabel}>по</span>
              <div className={s.rangeInlineField}>
                <PickerInput type="time" value={draft.timeTo} onChange={handleTimeToChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={s.section}>
        <label className={s.label}>День</label>
        <SelectDropdown
          mode="multi"
          value={draft.weekdays}
          options={store.weekdayOptions}
          placeholder="Выберите день"
          onChange={handleWeekdaysChange}
          searchable
        />
      </div>
      <div className={s.section}>
        <label className={s.label}>Преподаватель</label>
        <SelectDropdown
          mode="multi"
          value={draft.teachers}
          placeholder="Выберите преподавателя"
          options={store.teacherOptions}
          onChange={handleTeachersChange}
          searchable
        />
      </div>
      <div className={s.section}>
        <label className={s.label}>Студия</label>
        <SelectDropdown
          mode="multi"
          value={draft.studios}
          placeholder="Выберите студию"
          options={store.studioOptions}
          onChange={handleStudiosChange}
          searchable
        />
      </div>
      <div className={s.section}>
        <label className={s.label}>Цена</label>
        <div className={s.priceRange}>
          <input
            type="number"
            className={s.priceInput}
            placeholder="от"
            min={0}
            value={draft.priceFrom}
            onChange={handlePriceFromChange}
          />
          <span className={s.priceMeta}>-</span>
          <input
            type="number"
            className={s.priceInput}
            placeholder="до"
            min={0}
            value={draft.priceTo}
            onChange={handlePriceToChange}
          />
          <span className={s.priceMeta}>руб</span>
        </div>
      </div>
      <div className={s.actions}>
        <Button mode="dark" type="button" onClick={handleReset}>
          Сбросить фильтры
        </Button>
        <Button mode="purple" type="button" onClick={handleSubmit}>
          Применить фильтры
        </Button>
      </div>
    </div>
  );
});

export type { CoursesFiltersValue };

export default React.memo(Filters);
