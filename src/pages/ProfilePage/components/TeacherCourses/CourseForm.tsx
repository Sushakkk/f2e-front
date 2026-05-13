import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';

import ArrowIcon from 'assets/images/arrow.svg?react';
import {
  CloseIconButton,
  DateRangePicker,
  FormField,
  ImageUploadButton,
  Modal,
  SectionHeader,
  SelectDropdown,
} from 'components/common';
import Button from 'components/common/Button/Button';
import { COURSE_LEVELS } from 'config/levels';
import type { ProfilePageStore } from 'store/ProfilePageStore';
import { useDanceStylesStore } from 'store/hooks';
import {
  ddmmToIso,
  formatRu,
  fromIsoDate,
  normalizeScheduleTimeInput,
  toDDMM,
} from 'utils/dateUtils';

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

const formatLessonPlace = (location?: string, studio?: string): string =>
  [location, studio].filter(Boolean).join(', ') || '—';

const CourseForm: React.FC<Props> = ({ store, teacherId, isEditing }) => {
  const danceStylesStore = useDanceStylesStore();
  const form = store.courseFormData;
  const errors = store.courseFormErrors;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(0);
  const [pendingCancelLessonId, setPendingCancelLessonId] = React.useState<number | null>(null);
  const getError = React.useCallback((key: string) => errors[key], [errors]);

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

  const closeCancelLessonModal = React.useCallback(() => {
    setPendingCancelLessonId(null);
  }, []);

  const confirmCancelLesson = React.useCallback(() => {
    if (pendingCancelLessonId === null) {
      return;
    }

    const id = pendingCancelLessonId;

    setPendingCancelLessonId(null);
    void store.cancelLesson(id);
  }, [pendingCancelLessonId, store]);

  const cancelLessonModalMessage = React.useMemo(() => {
    if (pendingCancelLessonId === null) {
      return 'Отменить это занятие?';
    }

    const lesson = store.courseFormLessons.find((l) => l.id === pendingCancelLessonId);

    if (!lesson) {
      return 'Отменить это занятие?';
    }

    const dateStr = formatRu(lesson.date);

    if (!dateStr) {
      return 'Отменить это занятие?';
    }

    return `Отменить занятие от ${dateStr}?`;
  }, [pendingCancelLessonId, store.courseFormLessons]);

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <Modal
        open={pendingCancelLessonId !== null}
        message={cancelLessonModalMessage}
        onClose={closeCancelLessonModal}
        onConfirm={confirmCancelLesson}
      />
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
        <FormField
          className={s.field}
          label="Название"
          labelClassName={s.label}
          error={getError('name')}
          errorClassName={s.error}
          required
          requiredMarkClassName={s.requiredMark}
        >
          <input
            className={cx(getError('name') && s.inputError)}
            value={form.name}
            placeholder="Введите название курса"
            onChange={(e) => store.updateFormField('name', e.target.value)}
            required
          />
        </FormField>
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
          {getError('type') && <span className={s.error}>{getError('type')}</span>}
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
          {getError('level') && <span className={s.error}>{getError('level')}</span>}
        </label>
        <FormField
          className={s.field}
          label="Количество мест"
          labelClassName={s.label}
          error={getError('capacity')}
          errorClassName={s.error}
          required
          requiredMarkClassName={s.requiredMark}
        >
          <input
            className={cx(getError('capacity') && s.inputError)}
            type="number"
            min={1}
            value={form.capacity}
            placeholder="Введите количество мест"
            onChange={(e) => store.updateFormField('capacity', e.target.value)}
            required
          />
        </FormField>
        <FormField
          className={s.fieldWide}
          label="Даты курса"
          labelClassName={s.label}
          error={getError('dateFrom') ?? getError('dateTo')}
          errorClassName={s.error}
          required
          requiredMarkClassName={s.requiredMark}
        >
          <DateRangePicker from={dateFromIso} to={dateToIso} onChange={handleDateRangeChange} />
        </FormField>
        <FormField
          className={s.field}
          label="Цена (₽)"
          labelClassName={s.label}
          error={getError('price')}
          errorClassName={s.error}
          required
          requiredMarkClassName={s.requiredMark}
        >
          <input
            className={cx(getError('price') && s.inputError)}
            type="number"
            value={form.price}
            placeholder="Введите цену"
            onChange={(e) => store.updateFormField('price', e.target.value)}
            required
          />
        </FormField>
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
          {getError('city') && <span className={s.error}>{getError('city')}</span>}
        </label>
      </div>
      <FormField className={s.field} label="Описание" labelClassName={s.label}>
        <textarea
          value={form.description}
          placeholder="Введите описание курса"
          onChange={(e) => store.updateFormField('description', e.target.value)}
          rows={3}
        />
      </FormField>
      <div className={s.grid}>
        <FormField
          className={s.fieldWide}
          label="Ссылка на музыку"
          labelClassName={s.label}
          error={getError('musicUrl')}
          errorClassName={s.error}
        >
          <input
            className={cx(getError('musicUrl') && s.inputError)}
            value={form.musicUrl}
            placeholder="https://..."
            onChange={(e) => store.updateFormField('musicUrl', e.target.value)}
          />
        </FormField>
      </div>
      <div className={s.scheduleSection}>
        <SectionHeader title="Расписание" onAdd={store.addScheduleEntry} addLabel="Добавить" />
        <div className={s.sameLocationBar}>
          <label className={s.checkboxRow}>
            <input
              type="checkbox"
              className={s.checkboxInput}
              checked={form.useSameLocation}
              onChange={(e) => store.setUseSameLocation(e.target.checked)}
            />
            <span className={s.checkboxIndicator} aria-hidden="true" />
            <span className={s.checkboxText}>Одинаковый адрес у всех занятий</span>
          </label>
          {form.useSameLocation && (
            <label className={s.sameLocationStudio}>
              <span className={s.sameLocationStudioLabel}>Студия {REQUIRED_MARK}</span>
              <SelectDropdown
                mode="single"
                value={form.studio}
                placeholder="Выберите студию"
                options={studioOptions}
                onChange={(v) => store.updateFormField('studio', v)}
                searchable
              />
              {getError('studio') && <span className={s.error}>{getError('studio')}</span>}
            </label>
          )}
        </div>
        {form.useSameLocation && (
          <FormField
            className={s.field}
            label="Адрес"
            labelClassName={s.label}
            error={getError('sharedLocation')}
            errorClassName={s.error}
            required
            requiredMarkClassName={s.requiredMark}
          >
            <input
              className={cx(getError('sharedLocation') && s.inputError)}
              value={form.sharedLocation}
              placeholder="м. Павелецкая"
              onChange={(e) => store.updateSharedLocation(e.target.value)}
            />
          </FormField>
        )}
        {getError('schedule') && <span className={s.error}>{getError('schedule')}</span>}
        {form.schedule.map((entry, idx) => (
          <div key={idx} className={s.scheduleEntry}>
            <div className={s.scheduleFields}>
              <FormField
                className={s.scheduleField}
                label="День недели"
                labelClassName={s.scheduleLabel}
                error={getError(`schedule.${idx}.weekday`)}
                errorClassName={s.error}
                required
                requiredMarkClassName={s.requiredMark}
              >
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
              </FormField>
              <FormField
                className={s.scheduleField}
                label="Время"
                labelClassName={s.scheduleLabel}
                error={getError(`schedule.${idx}.timeFrom`) ?? getError(`schedule.${idx}.timeTo`)}
                errorClassName={s.error}
                required
                requiredMarkClassName={s.requiredMark}
              >
                <div className={s.scheduleTimeRow}>
                  <input
                    className={cx(getError(`schedule.${idx}.timeFrom`) && s.inputError)}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={5}
                    value={entry.timeFrom}
                    placeholder="Начало, ЧЧ:ММ"
                    required
                    onChange={(e) => {
                      const next = normalizeScheduleTimeInput(entry.timeFrom, e.target.value);

                      store.updateScheduleEntry(idx, 'timeFrom', next);
                    }}
                  />
                  <input
                    className={cx(getError(`schedule.${idx}.timeTo`) && s.inputError)}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={5}
                    value={entry.timeTo}
                    placeholder="Конец, ЧЧ:ММ"
                    required
                    onChange={(e) => {
                      const next = normalizeScheduleTimeInput(entry.timeTo, e.target.value);

                      store.updateScheduleEntry(idx, 'timeTo', next);
                    }}
                  />
                </div>
              </FormField>
              {!form.useSameLocation && (
                <>
                  <label className={s.scheduleField}>
                    <span className={s.scheduleLabel}>Студия</span>
                    <SelectDropdown
                      mode="single"
                      value={entry.studio ?? ''}
                      placeholder="Выберите студию"
                      options={studioOptions}
                      onChange={(v) => store.updateScheduleEntry(idx, 'studio', v)}
                      searchable
                    />
                  </label>
                  <FormField
                    className={s.scheduleField}
                    label="Адрес"
                    labelClassName={s.scheduleLabel}
                    error={getError(`schedule.${idx}.location`)}
                    errorClassName={s.error}
                    required
                    requiredMarkClassName={s.requiredMark}
                  >
                    <input
                      className={cx(getError(`schedule.${idx}.location`) && s.inputError)}
                      value={entry.location ?? ''}
                      placeholder="м. Павелецкая"
                      onChange={(e) => store.updateScheduleEntry(idx, 'location', e.target.value)}
                      required
                    />
                  </FormField>
                </>
              )}
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
      {isEditing && (
        <section className={s.formLessons} aria-labelledby="course-form-lessons-heading">
          <h3 id="course-form-lessons-heading" className={s.formLessons__title}>
            Занятия
          </h3>
          {store.courseFormLessons.length === 0 ? (
            <p className={s.formLessons__empty}>Нет занятий для этого курса</p>
          ) : (
            <div className={s.formLessons__tableScroll}>
              <div className={s.formLessons__tableInner}>
                <div className={s.formLessons__head}>
                  <span className={s.formLessons__colDate}>Дата</span>
                  <span className={s.formLessons__colTime}>Время</span>
                  <span className={s.formLessons__colLocation}>Место</span>
                  <span className={s.formLessons__colStatus}>Статус</span>
                  <span className={s.formLessons__colAction} />
                </div>
                {store.courseFormLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={cx(
                      s.formLessons__row,
                      lesson.status === 'cancelled' && s.formLessons__row_cancelled,
                      lesson.status === 'completed' && s.formLessons__row_completed
                    )}
                  >
                    <span className={s.formLessons__colDate}>{formatRu(lesson.date)}</span>
                    <span className={s.formLessons__colTime}>
                      {lesson.timeFrom}–{lesson.timeTo}
                    </span>
                    <span className={s.formLessons__colLocation}>
                      {formatLessonPlace(lesson.location, lesson.studio)}
                    </span>
                    <span
                      className={cx(
                        s.formLessons__colStatus,
                        lesson.status === 'scheduled' && s.formLessons__statusScheduled,
                        lesson.status === 'cancelled' && s.formLessons__statusCancelled,
                        lesson.status === 'completed' && s.formLessons__statusCompleted
                      )}
                    >
                      {lesson.status === 'scheduled'
                        ? 'Запланировано'
                        : lesson.status === 'completed'
                          ? 'Завершено'
                          : 'Отменено'}
                    </span>
                    <span className={s.formLessons__colAction}>
                      {lesson.status === 'scheduled' && (
                        <button
                          type="button"
                          className={s.formLessons__cancelBtn}
                          disabled={store.isLoading}
                          onClick={() => setPendingCancelLessonId(lesson.id)}
                        >
                          Отменить занятие
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
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
