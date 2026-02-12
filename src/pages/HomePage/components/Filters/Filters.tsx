import * as React from 'react';

import { Button } from 'components/common';
import { CourseConfigItem, CourseLevel } from 'pages/HomePage/config/cards';
import { COURSE_LEVEL_LABELS } from 'pages/HomePage/config/levels';

import s from './Filters.module.scss';
import { PickerInput } from './PickerInput';
import { DateRangePicker } from './DateRangePicker';
import { SelectDropdown } from './SelectDropdown';

export type CoursesFiltersValue = {
  titles: string[];
  levels: CourseLevel[];
  teachers?: string[];
  studios?: string[];
  weekdays?: string[];
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  priceFrom?: number;
  priceTo?: number;
};

type Props = {
  courses: CourseConfigItem[];
  value: CoursesFiltersValue;
  onApply: (v: CoursesFiltersValue) => void;
  onClose?: () => void;
};

type DraftState = {
  titles: string[];
  levels: CourseLevel[];
  teachers: string[];
  studios: string[];
  weekdays: string[];
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  priceFrom: string;
  priceTo: string;
};

function uniqSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ru'));
}

const LEVELS_ORDER: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

function toDraft(value: CoursesFiltersValue): DraftState {
  return {
    titles: value.titles ?? [],
    levels: value.levels ?? [],
    teachers: value.teachers ?? [],
    studios: value.studios ?? [],
    weekdays: value.weekdays ?? [],
    dateFrom: value.dateFrom ?? '',
    dateTo: value.dateTo ?? '',
    timeFrom: value.timeFrom ?? '',
    timeTo: value.timeTo ?? '',
    priceFrom: value.priceFrom === undefined ? '' : String(value.priceFrom),
    priceTo: value.priceTo === undefined ? '' : String(value.priceTo),
  };
}

function parseNumberOrUndef(v: string): number | undefined {
  const n = Number(v);

  return Number.isFinite(n) ? n : undefined;
}

function toApplied(draft: DraftState): CoursesFiltersValue {
  const priceFrom = draft.priceFrom.trim() ? parseNumberOrUndef(draft.priceFrom) : undefined;
  const priceTo = draft.priceTo.trim() ? parseNumberOrUndef(draft.priceTo) : undefined;

  return {
    titles: draft.titles,
    levels: draft.levels,
    teachers: draft.teachers.length > 0 ? draft.teachers : undefined,
    studios: draft.studios.length > 0 ? draft.studios : undefined,
    weekdays: draft.weekdays.length > 0 ? draft.weekdays : undefined,
    dateFrom: draft.dateFrom || undefined,
    dateTo: draft.dateTo || undefined,
    timeFrom: draft.timeFrom || undefined,
    timeTo: draft.timeTo || undefined,
    priceFrom,
    priceTo,
  };
}

const WEEKDAYS: { value: string; label: string }[] = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
  { value: 'sunday', label: 'Воскресенье' },
];

export const Filters: React.FC<Props> = ({ courses, value, onApply, onClose }) => {
  const [draft, setDraft] = React.useState<DraftState>(() => toDraft(value));

  React.useEffect(() => {
    setDraft(toDraft(value));
  }, [value]);

  const isCourseLevel = React.useCallback((v: string): v is CourseLevel => {
    return LEVELS_ORDER.includes(v as CourseLevel);
  }, []);

  const titleOptions = React.useMemo(() => {
    return uniqSorted(courses.map((c) => c.title).filter(Boolean));
  }, [courses]);

  const teacherOptions = React.useMemo(() => {
    return uniqSorted(courses.map((c) => c.teacher).filter(Boolean));
  }, [courses]);

  const levelOptions = React.useMemo(() => {
    const set = new Set<CourseLevel>();

    courses.forEach((c) => set.add(c.level));

    return LEVELS_ORDER.filter((x) => set.has(x));
  }, [courses]);

  const toggleTitle = React.useCallback((title: string) => {
    setDraft((prev) => {
      const next = new Set(prev.titles);

      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }

      return { ...prev, titles: Array.from(next) };
    });
  }, []);

  const onReset = React.useCallback(() => {
    onApply({ titles: [], levels: [] });
  }, [onApply]);

  const onSubmit = React.useCallback(() => {
    onApply(toApplied(draft));
    onClose?.();
  }, [draft, onApply, onClose]);

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
          {titleOptions.map((t) => (
            <button
              key={t}
              type="button"
              className={s.optionBtn}
              data-active={draft.titles.includes(t)}
              onClick={() => toggleTitle(t)}
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
          clearLabel="Выберите уровень"
          options={levelOptions.map((lvl) => ({ value: lvl, label: COURSE_LEVEL_LABELS[lvl] }))}
          onChange={(next) =>
            setDraft((p) => ({
              ...p,
              levels: next.filter(isCourseLevel),
            }))
          }
          searchable
        />
      </div>
      <div className={s.section}>
        <label className={s.label}>Дата и время</label>
        <div className={s.row}>
          <DateRangePicker
            from={draft.dateFrom}
            to={draft.dateTo}
            onChange={({ from, to }) => setDraft((p) => ({ ...p, dateFrom: from, dateTo: to }))}
          />
          <div className={s.timeRange}>
            <div className={s.rangeInline}>
              <span className={s.rangeInlineLabel}>с</span>
              <div className={s.rangeInlineField}>
                <PickerInput
                  type="time"
                  value={draft.timeFrom}
                  onChange={(v) => setDraft((p) => ({ ...p, timeFrom: v }))}
                />
              </div>
            </div>
            <div className={s.rangeInline}>
              <span className={s.rangeInlineLabel}>по</span>
              <div className={s.rangeInlineField}>
                <PickerInput
                  type="time"
                  value={draft.timeTo}
                  onChange={(v) => setDraft((p) => ({ ...p, timeTo: v }))}
                />
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
          options={WEEKDAYS}
          placeholder="Выберите день"
          clearLabel="Выберите день"
          onChange={(next) => setDraft((p) => ({ ...p, weekdays: next }))}
          searchable
        />
      </div>
      <div className={s.section}>
        <label className={s.label}>Преподаватель</label>
        <SelectDropdown
          mode="multi"
          value={draft.teachers}
          placeholder="Выберите преподавателя"
          clearLabel="Выберите преподавателя"
          options={teacherOptions.map((t) => ({ value: t, label: t }))}
          onChange={(v) => setDraft((p) => ({ ...p, teachers: v }))}
          searchable
        />
      </div>
      <div className={s.section}>
        <label className={s.label}>Студия</label>
        <SelectDropdown
          mode="multi"
          value={draft.studios}
          placeholder="Выберите студию"
          clearLabel="Выберите студию"
          options={['ТанцХаб', 'DanceLab', 'Студия движения', 'Арт-пространство', 'Грация'].map((x) => ({
            value: x,
            label: x,
          }))}
          onChange={(v) => setDraft((p) => ({ ...p, studios: v }))}
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
            onChange={(e) => setDraft((p) => ({ ...p, priceFrom: e.target.value }))}
          />
          <span className={s.priceMeta}>-</span>
          <input
            type="number"
            className={s.priceInput}
            placeholder="до"
            min={0}
            value={draft.priceTo}
            onChange={(e) => setDraft((p) => ({ ...p, priceTo: e.target.value }))}
          />
          <span className={s.priceMeta}>руб.</span>
        </div>
      </div>
      <div className={s.actions}>
        <Button mode="dark" type="button" onClick={onReset}>
          Сбросить фильтры
        </Button>
        <Button mode="purple" type="button" onClick={onSubmit}>
          Применить фильтры
        </Button>
      </div>
    </div>
  );
};

export default React.memo(Filters);
