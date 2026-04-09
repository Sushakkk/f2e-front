import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';

import ArrowIcon from 'assets/images/arrow.svg?react';
import {
  CloseIconButton,
  DateRangePicker,
  ImageUploadButton,
  SectionHeader,
  SelectDropdown,
} from 'components/common';
import Button from 'components/common/Button/Button';
import { COURSE_LEVELS } from 'config/levels';
import type { ProfilePageStore } from 'store/ProfilePageStore';
import { useDanceStylesStore } from 'store/hooks';
import { ddmmToIso, fromIsoDate, toDDMM } from 'utils/dateUtils';

import s from './CourseForm.module.scss';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const LEVEL_OPTIONS = COURSE_LEVELS.map((lvl) => ({ value: lvl, label: lvl }));
const WEEKDAY_OPTIONS = WEEKDAYS.map((w) => ({ value: w, label: w }));
const REQUIRED_MARK = <span className={s.requiredMark}>*</span>;

type Props = {
  store: ProfilePageStore;
  teacherId: number;
  isEditing: boolean;
};

const REFERENCE_YEAR = new Date().getFullYear();

const CourseForm: React.FC<Props> = ({ store, teacherId, isEditing }) => {
  const danceStylesStore = useDanceStylesStore();
  const form = store.courseFormData;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(0);

  React.useEffect(() => {
    void danceStylesStore.requestDanceStyles();
    void store.loadReferenceData();
  }, [danceStylesStore, store]);

  const studioOptions = React.useMemo(
    () =>
      store.studios
        .filter((studio) => !form.city || studio.city === form.city)
        .map((studio) => ({ value: studio.name, label: studio.name })),
    [form.city, store.studios]
  );

  const cityOptions = React.useMemo(
    () => store.cities.map((city) => ({ value: city.name, label: city.name })),
    [store.cities]
  );

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

  const previewCount = store.courseImagePreviews.length;

  React.useEffect(() => {
    setSelectedPhotoIndex((prev) => {
      if (previewCount === 0) {
        return 0;
      }

      return Math.min(prev, previewCount - 1);
    });
  }, [previewCount]);

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
      <div className={s.imageSection}>
        {previewCount > 0 && (
          <p className={s.cardPhotoHint}>
            Первое фото в ряду будет отображаться на карточке курса в каталоге.
            <br />
            Нажмите на фото и перетащите его в нужное место.
          </p>
        )}
        {previewCount > 0 && (
          <div className={s.gallery}>
            {store.courseImagePreviews.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={cx(
                  s.galleryItem,
                  previewCount > 1 && s.galleryItem_selectable,
                  index === selectedPhotoIndex && s.galleryItem_selected
                )}
                onClick={() => {
                  if (previewCount > 1) {
                    setSelectedPhotoIndex(index);
                  }
                }}
              >
                <div className={s.galleryImageWrap}>
                  <img className={s.galleryImage} src={image} alt={`Фото ${index + 1}`} />
                  <span
                    className={s.imageRemoveHitbox}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <CloseIconButton
                      className={s.imageRemoveBtn}
                      iconClassName={s.imageRemoveIcon}
                      onClick={() => store.removeCourseImage(index)}
                      ariaLabel={`Удалить фото ${index + 1}`}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {previewCount > 1 && (
          <div className={s.reorderBar}>
            <div className={s.reorderRow}>
              <button
                type="button"
                className={s.reorderBtn}
                disabled={selectedPhotoIndex === 0}
                onClick={() => {
                  store.moveCourseImage(selectedPhotoIndex, -1);
                  setSelectedPhotoIndex((i) => i - 1);
                }}
                aria-label="Сдвинуть выбранное фото влево"
              >
                <ArrowIcon className={s.reorderIconLeft} />
              </button>
              <button
                type="button"
                className={s.reorderBtn}
                disabled={selectedPhotoIndex === previewCount - 1}
                onClick={() => {
                  store.moveCourseImage(selectedPhotoIndex, 1);
                  setSelectedPhotoIndex((i) => i + 1);
                }}
                aria-label="Сдвинуть выбранное фото вправо"
              >
                <ArrowIcon className={s.reorderIconRight} />
              </button>
            </div>
          </div>
        )}
        <ImageUploadButton
          label="Добавить фотографии"
          className={s.utilityBtn}
          multiple
          onSelect={(files) => store.setCourseImageFiles(files)}
        />
      </div>
      <div className={s.grid}>
        <label className={s.field}>
          <span className={s.label}>Название {REQUIRED_MARK}</span>
          <input
            className={s.input}
            value={form.name}
            placeholder="Введите название курса"
            onChange={(e) => store.updateFormField('name', e.target.value)}
            required
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Стиль танца {REQUIRED_MARK}</span>
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
          <span className={s.label}>Уровень {REQUIRED_MARK}</span>
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
            <span className={s.label}>Даты курса {REQUIRED_MARK}</span>
            <DateRangePicker from={dateFromIso} to={dateToIso} onChange={handleDateRangeChange} />
          </label>
          <label className={s.field}>
            <span className={s.label}>Цена (₽) {REQUIRED_MARK}</span>
            <input
              className={s.input}
              type="number"
              value={form.price}
              placeholder="Введите цену"
              onChange={(e) => store.updateFormField('price', e.target.value)}
              required
            />
          </label>
        </div>
        <label className={s.field}>
          <span className={s.label}>Студия {REQUIRED_MARK}</span>
          <SelectDropdown
            mode="single"
            value={form.studio}
            placeholder="Выберите студию"
            options={studioOptions}
            onChange={(v) => store.updateFormField('studio', v)}
            searchable
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Город {REQUIRED_MARK}</span>
          <SelectDropdown
            mode="single"
            value={form.city}
            placeholder="Выберите город"
            options={cityOptions}
            onChange={(v) => store.updateFormField('city', v)}
            searchable
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Вместимость {REQUIRED_MARK}</span>
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
          placeholder="Введите описание курса"
          onChange={(e) => store.updateFormField('description', e.target.value)}
          rows={3}
        />
      </label>
      <div className={s.grid}>
        <label className={s.fieldWide}>
          <span className={s.label}>Ссылка на музыку</span>
          <input
            className={s.input}
            value={form.musicUrl}
            placeholder="https://..."
            onChange={(e) => store.updateFormField('musicUrl', e.target.value)}
          />
        </label>
      </div>
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
