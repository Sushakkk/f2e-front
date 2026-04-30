import { observer } from 'mobx-react';
import * as React from 'react';

import { SectionHeader, Card } from 'components/common';
import { COURSES_CONFIG } from 'config/cards';
import type { Enrollment } from 'config/users';
import { fromIsoDate } from 'utils/dateUtils';

import s from './StudentEnrollments.module.scss';

type Props = {
  enrollments: Enrollment[];
};

const StudentEnrollments: React.FC<Props> = ({ enrollments }) => {
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
    () => enrollments.filter((e) => e.status === 'active' && !isCompletedEnrollment(e)),
    [enrollments, isCompletedEnrollment]
  );

  const completed = React.useMemo(
    () => enrollments.filter((e) => isCompletedEnrollment(e)),
    [enrollments, isCompletedEnrollment]
  );

  if (active.length === 0 && completed.length === 0) {
    return <div className={s.empty}>У вас пока нет записей на курсы</div>;
  }

  return (
    <div className={s.root}>
      {active.length > 0 && (
        <div className={s.section}>
          <SectionHeader title="Активные курсы" />
          <div className={s.courseList}>
            {active.map((e) => {
              const course = e.course ?? COURSES_CONFIG.find((c) => c.id === e.courseId);

              if (!course) {
                return null;
              }

              return (
                <div key={e.courseId} className={s.cardWrapper}>
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
            {completed.map((e) => {
              const course = e.course ?? COURSES_CONFIG.find((c) => c.id === e.courseId);

              if (!course) {
                return null;
              }

              return (
                <div key={e.courseId} className={s.cardWrapper} data-completed>
                  <Card item={course} compact profile className={s.courseCard} />
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
