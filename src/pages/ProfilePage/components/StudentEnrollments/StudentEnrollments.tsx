import { observer } from 'mobx-react';
import * as React from 'react';

import { Card, SectionHeader, SelectDropdown } from 'components/common';
import Button from 'components/common/Button/Button';
import FormField from 'components/common/FormField/FormField';
import Modal from 'components/common/Modal/Modal';
import { ENDPOINTS } from 'config/api';
import { COURSES_CONFIG } from 'config/cards';
import type { Enrollment } from 'config/users';
import { useRootStore } from 'store/globals/root';
import type { ErrorResponse } from 'store/globals/api/types';
import { fromIsoDate } from 'utils/dateUtils';

import s from './StudentEnrollments.module.scss';

type Props = {
  enrollments: Enrollment[];
};

const StudentEnrollments: React.FC<Props> = ({ enrollments }) => {
  const rootStore = useRootStore();
  const reviewRatingOptions = React.useMemo(
    () =>
      [5, 4, 3, 2, 1].map((value) => ({
        value: String(value),
        label: String(value),
      })),
    []
  );
  const [reviewCourseId, setReviewCourseId] = React.useState<number | null>(null);
  const [reviewText, setReviewText] = React.useState('');
  const [reviewRating, setReviewRating] = React.useState('5');
  const [reviewError, setReviewError] = React.useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const [reviewedCourseIds, setReviewedCourseIds] = React.useState<number[]>([]);

  const isCompletedEnrollment = React.useCallback((enrollment: Enrollment): boolean => {
    if (enrollment.status === 'completed' || enrollment.courseStatus === 'completed') {
      return true;
    }

    const courseDateTo = enrollment.courseDateTo ? fromIsoDate(enrollment.courseDateTo) : null;

    if (courseDateTo) {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      return courseDateTo < today;
    }

    return false;
  }, []);

  const active = React.useMemo(
    () =>
      enrollments.filter(
        (enrollment) => enrollment.status === 'active' && !isCompletedEnrollment(enrollment)
      ),
    [enrollments, isCompletedEnrollment]
  );

  const completed = React.useMemo(
    () => enrollments.filter((enrollment) => isCompletedEnrollment(enrollment)),
    [enrollments, isCompletedEnrollment]
  );

  const closeReviewModal = React.useCallback(() => {
    setReviewCourseId(null);
    setReviewText('');
    setReviewRating('5');
    setReviewError(null);
    setIsSubmittingReview(false);
  }, []);

  const submitReview = React.useCallback(async () => {
    if (reviewCourseId === null || isSubmittingReview) {
      return;
    }

    const text = reviewText.trim();

    if (!text) {
      setReviewError('Введите текст отзыва');

      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    const response = await rootStore.apiStore
      .createExtendedRequest<
        { id: number; rating: number; text: string; created_at: string },
        ErrorResponse
      >({
        ...ENDPOINTS.courses.review(reviewCourseId),
        showExpectedError: false,
        showUnexpectedError: true,
      })
      .call({
        data: {
          rating: Number(reviewRating),
          text,
        },
      });

    if (response.isError) {
      setIsSubmittingReview(false);
      setReviewError(response.data?.message ?? 'Не удалось отправить отзыв');

      return;
    }

    setReviewedCourseIds((prev) => [...prev, reviewCourseId]);
    closeReviewModal();
  }, [closeReviewModal, isSubmittingReview, reviewCourseId, reviewRating, reviewText, rootStore]);

  if (active.length === 0 && completed.length === 0) {
    return <div className={s.empty}>У вас пока нет записей на курсы</div>;
  }

  return (
    <div className={s.root}>
      <Modal
        open={reviewCourseId !== null}
        onClose={closeReviewModal}
        onConfirm={submitReview}
        message="Оставить отзыв о курсе"
        className={s.reviewModal}
        confirmText={isSubmittingReview ? 'Отправка...' : 'Отправить'}
        cancelText="Отмена"
        confirmMode="purple"
        cancelMode="dark"
      >
        <div className={s.reviewForm}>
          <FormField className={s.reviewField} label="Оценка" labelClassName={s.reviewLabel}>
            <SelectDropdown
              mode="single"
              value={reviewRating}
              options={reviewRatingOptions}
              onChange={setReviewRating}
            />
          </FormField>
          <FormField className={s.reviewField} label="Текст отзыва" labelClassName={s.reviewLabel}>
            <textarea
              className={s.reviewTextarea}
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Напишите ваш отзыв"
              rows={5}
              disabled={isSubmittingReview}
            />
          </FormField>
          {reviewError && <div className={s.reviewError}>{reviewError}</div>}
        </div>
      </Modal>

      {active.length > 0 && (
        <div className={s.section}>
          <SectionHeader title="Активные курсы" />
          <div className={s.courseList}>
            {active.map((enrollment) => {
              const course = enrollment.course ?? COURSES_CONFIG.find((item) => item.id === enrollment.courseId);

              if (!course) {
                return null;
              }

              return (
                <div key={enrollment.courseId} className={s.cardWrapper}>
                  <Card item={course} compact profile className={s.courseCard} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className={s.section}>
          <SectionHeader title="Завершённые курсы" />
          <div className={s.courseList}>
            {completed.map((enrollment) => {
              const course = enrollment.course ?? COURSES_CONFIG.find((item) => item.id === enrollment.courseId);

              if (!course) {
                return null;
              }

              const isReviewed = reviewedCourseIds.includes(enrollment.courseId);
              const canLeaveReview = course.canLeaveReview ?? false;

              return (
                <div key={enrollment.courseId} className={s.cardWrapper} data-completed>
                  <Card
                    item={course}
                    compact
                    profile
                    dimmed
                    className={s.courseCard}
                    actions={
                      canLeaveReview ? (
                        <Button
                          mode="purple"
                          className={s.reviewButton}
                          disabled={isReviewed}
                          onClick={() => setReviewCourseId(enrollment.courseId)}
                        >
                          {isReviewed ? 'Отзыв отправлен' : 'Оставить отзыв'}
                        </Button>
                      ) : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(StudentEnrollments);
