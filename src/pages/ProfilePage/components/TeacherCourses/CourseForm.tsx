import { observer } from 'mobx-react';
import * as React from 'react';

import { DateRangePicker, SectionHeader, SelectDropdown } from 'components/common';
import Button from 'components/common/Button/Button';
import { COURSES_CONFIG } from 'config/cards';
import { COURSE_LEVELS } from 'config/levels';
import type { ProfilePageStore } from 'store/ProfilePageStore';
import { useDanceStylesStore } from 'store/hooks';
import { ddmmToIso, fromIsoDate, toDDMM } from 'utils/dateUtils';

import s from './CourseForm.module.scss';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const LEVEL_OPTIONS = COURSE_LEVELS.map((lvl) => ({ value: lvl, label: lvl }));
const WEEKDAY_OPTIONS = WEEKDAYS.map((w) => ({ value: w, label: w }));

const makeSelectOptions = (key: 'type' | 'studio' | 'city'): { value: string; label: string }[] =>
  [...new Map(COURSES_CONFIG.map((c) => [c[key], { value: c[key], label: c[key] }])).values()].sort(
    (a, b) => a.label.localeCompare(b.label)
  );

const STUDIO_OPTIONS = makeSelectOptions('studio');
const CITY_OPTIONS = makeSelectOptions('city');

type Props = {
  store: ProfilePageStore;
  teacherId: number;
  isEditing: boolean;
};

const REFERENCE_YEAR = new Date().getFullYear();

const CourseForm: React.FC<Props> = ({ store, teacherId, isEditing }) => {
  const danceStylesStore = useDanceStylesStore();
  const form = store.courseFormData;

  React.useEffect(() => {
    void danceStylesStore.requestDanceStyles();
  }, [danceStylesStore]);

  const dateFromIso = React.useMemo(
    () => ddmmToIso(form.dateFrom, REFERENCE_YEAR),
    [form.dateFrom]
  );

  const dateToIso = React.useMemo(() => ddmmToIso(form.dateTo, REFERENCE_YEAR), [form.dateTo]);

  const handleDateRangeChange = React.useCallback(
    ({ from, to }: { from: string; to: string }) => {
      const fromDate = fromIsoDate(from);
      const toDate = fromIsoDate(to);

      store.updateFormField('dateFrom', fromDate ? toDDMM(fromDate) : '');
      store.updateFormField('dateTo', toDate ? toDDMM(toDate) : '');
    },
    [store]
  );

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (isEditing) {
        void store.updateCourse(teacherId);
      } else {
        void store.createCourse(teacherId);
      }
    },
    [isEditing, store, teacherId]
  );

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.header}>
        <h2 className={s.formTitle}>{isEditing ? 'Редактировать курс' : 'Создать курс'}</h2>
        <button type="button" className={s.closeBtn} onClick={store.closeForm}>
          &times;
        </button>
      </div>
      <div className={s.grid}>
        <label className={s.field}>
          <span className={s.label}>Название</span>
          <input
            className={s.input}
            value={form.name}
            onChange={(e) => store.updateFormField('name', e.target.value)}
            required
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Стиль танца</span>
          <SelectDropdown
            mode="single"
            value={form.type}
            placeholder="Выберите или введите стиль"
            options={danceStylesStore.options}
            onChange={(v) => store.updateFormField('type', v)}
            searchable
            allowCustomValue
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Уровень</span>
          <SelectDropdown
            mode="single"
            value={form.level}
            placeholder="Выберите уровень"
            options={LEVEL_OPTIONS}
            onChange={(v) => store.updateFormField('level', v)}
          />
        </label>
        <div className={s.datesPriceRow}>
          <label className={s.field}>
            <span className={s.label}>Даты курса</span>
            <DateRangePicker from={dateFromIso} to={dateToIso} onChange={handleDateRangeChange} />
          </label>
          <label className={s.field}>
            <span className={s.label}>Цена (₽)</span>
            <input
              className={s.input}
              type="number"
              value={form.price}
              onChange={(e) => store.updateFormField('price', Number(e.target.value))}
              required
            />
          </label>
        </div>
        <label className={s.field}>
          <span className={s.label}>Студия</span>
          <SelectDropdown
            mode="single"
            value={form.studio}
            placeholder="Выберите или введите студию"
            options={STUDIO_OPTIONS}
            onChange={(v) => store.updateFormField('studio', v)}
            searchable
            allowCustomValue
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Город</span>
          <SelectDropdown
            mode="single"
            value={form.city}
            placeholder="Выберите или введите город"
            options={CITY_OPTIONS}
            onChange={(v) => store.updateFormField('city', v)}
            searchable
            allowCustomValue
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Вместимость</span>
          <input
            className={s.input}
            type="number"
            value={form.capacity}
            onChange={(e) => store.updateFormField('capacity', Number(e.target.value))}
            required
          />
        </label>
      </div>
      <label className={s.field}>
        <span className={s.label}>Описание</span>
        <textarea
          className={s.textarea}
          value={form.description}
          onChange={(e) => store.updateFormField('description', e.target.value)}
          rows={3}
        />
      </label>
      <div className={s.scheduleSection}>
        <SectionHeader title="Расписание" onAdd={store.addScheduleEntry} addLabel="Добавить" />
        {form.schedule.map((entry, idx) => (
          <div key={idx} className={s.scheduleEntry}>
            <div className={s.scheduleFields}>
              <div className={s.scheduleField}>
                <span className={s.scheduleLabel}>День недели</span>
                <SelectDropdown
                  mode="multi"
                  value={entry.weekday
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean)}
                  placeholder="Выберите дни"
                  options={WEEKDAY_OPTIONS}
                  onChange={(v) => store.updateScheduleEntry(idx, 'weekday', v.join(', '))}
                  searchable
                />
              </div>
              <div className={s.scheduleField}>
                <span className={s.scheduleLabel}>Время</span>
                <div className={s.scheduleTimeRow}>
                  <input
                    className={s.input}
                    value={entry.timeFrom}
                    placeholder="18:00"
                    onChange={(e) => store.updateScheduleEntry(idx, 'timeFrom', e.target.value)}
                  />
                  <input
                    className={s.input}
                    value={entry.timeTo}
                    placeholder="19:30"
                    onChange={(e) => store.updateScheduleEntry(idx, 'timeTo', e.target.value)}
                  />
                </div>
              </div>
              <div className={s.scheduleField}>
                <span className={s.scheduleLabel}>Адрес</span>
                <input
                  className={s.input}
                  value={entry.location ?? ''}
                  placeholder="м. Павелецкая"
                  onChange={(e) => store.updateScheduleEntry(idx, 'location', e.target.value)}
                />
              </div>
            </div>
            {form.schedule.length > 1 && (
              <button
                type="button"
                className={s.removeBtn}
                onClick={() => store.removeScheduleEntry(idx)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
      <div className={s.formActions}>
        <Button mode="purple" type="submit" className={s.submitBtn} disabled={store.isLoading}>
          {store.isLoading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
        </Button>
        <Button mode="dark" type="button" className={s.submitBtn} onClick={store.closeForm}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default observer(CourseForm);
