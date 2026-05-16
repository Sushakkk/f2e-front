import { observer } from 'mobx-react';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button, Card, Modal, SectionHeader } from 'components/common';
import {
  PROFILE_COURSES_QUERY_CREATE,
  PROFILE_COURSES_QUERY_EDIT,
} from 'config/router/profilePaths';
import type { ProfilePageStore } from 'store/ProfilePageStore';

import CourseForm from './CourseForm';
import s from './TeacherCourses.module.scss';

type Props = {
  store: ProfilePageStore;
  teacherId: number;
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активные',
  completed: 'Завершённые',
  cancelled: 'Отменённые',
};

const COURSE_EDIT_LOCK_HOURS = 48;

const TeacherCourses: React.FC<Props> = ({ store, teacherId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingCompleteCourseId, setPendingCompleteCourseId] = React.useState<number | null>(null);
  const [editBlockedCourseId, setEditBlockedCourseId] = React.useState<number | null>(null);
  const createParam = searchParams.get(PROFILE_COURSES_QUERY_CREATE);
  const editParam = searchParams.get(PROFILE_COURSES_QUERY_EDIT);

  React.useEffect(() => {
    if (editParam) {
      const courseId = Number(editParam);

      if (!Number.isFinite(courseId) || courseId <= 0) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);

            next.delete(PROFILE_COURSES_QUERY_EDIT);

            return next;
          },
          { replace: true }
        );

        return;
      }

      if (store.isFormOpen && store.editingCourseId === courseId) {
        return;
      }

      void store.openEditForm(courseId);

      return;
    }

    if (createParam === '1' && !store.isFormOpen) {
      store.openCreateForm();
    }
  }, [createParam, editParam, setSearchParams, store]);

  React.useEffect(() => {
    if (store.isFormOpen || store.isLoading) {
      return;
    }

    if (!createParam && !editParam) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        next.delete(PROFILE_COURSES_QUERY_CREATE);
        next.delete(PROFILE_COURSES_QUERY_EDIT);

        return next;
      },
      { replace: true }
    );
  }, [createParam, editParam, setSearchParams, store.isFormOpen, store.isLoading]);

  const openCreateInUrl = React.useCallback(() => {
    setSearchParams({ [PROFILE_COURSES_QUERY_CREATE]: '1' }, { replace: false });
  }, [setSearchParams]);

  const openEditInUrl = React.useCallback(
    (courseId: number) => {
      setSearchParams({ [PROFILE_COURSES_QUERY_EDIT]: String(courseId) }, { replace: false });
    },
    [setSearchParams]
  );

  const openCompleteConfirm = React.useCallback((e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    setPendingCompleteCourseId(courseId);
  }, []);

  const closeCompleteConfirm = React.useCallback(() => {
    setPendingCompleteCourseId(null);
  }, []);

  const confirmComplete = React.useCallback(() => {
    if (pendingCompleteCourseId === null) {
      return;
    }

    const id = pendingCompleteCourseId;

    setPendingCompleteCourseId(null);
    void store.completeCourse(id, teacherId);
  }, [pendingCompleteCourseId, store, teacherId]);

  const handleEdit = React.useCallback(
    (e: React.MouseEvent, courseId: number, canEdit?: boolean, firstLessonAt?: string) => {
      e.stopPropagation();

      const firstLessonTime = firstLessonAt ? new Date(firstLessonAt).getTime() : Number.NaN;
      const isEditLockedByTime =
        Number.isFinite(firstLessonTime) &&
        firstLessonTime - Date.now() <= COURSE_EDIT_LOCK_HOURS * 60 * 60 * 1000;

      if (canEdit === false || isEditLockedByTime) {
        setEditBlockedCourseId(courseId);
        store.showCourseEditUnavailableError();

        return;
      }

      setEditBlockedCourseId(null);
      void store.openEditForm(courseId);
      openEditInUrl(courseId);
    },
    [openEditInUrl, store]
  );

  if (store.isFormOpen) {
    return (
      <CourseForm store={store} teacherId={teacherId} isEditing={store.editingCourseId !== null} />
    );
  }

  const activeCourses = store.teacherCourses.filter((c) => c.courseStatus === 'active');
  const completedCourses = store.teacherCourses.filter((c) => c.courseStatus === 'completed');
  const cancelledCourses = store.teacherCourses.filter((c) => c.courseStatus === 'cancelled');

  return (
    <div className={s.root}>
      <Modal
        open={pendingCompleteCourseId !== null}
        onClose={closeCompleteConfirm}
        onConfirm={confirmComplete}
        message="Вы уверены, что хотите отменить курс?"
      />
      {store.teacherCourses.length === 0 && (
        <>
          <SectionHeader title="Мои курсы" onAdd={openCreateInUrl} addLabel="Создать курс" />
          <div className={s.empty}>У вас пока нет курсов</div>
        </>
      )}
      {store.teacherCourses.length > 0 && (
        <div className={s.list}>
          <div className={s.section}>
            <SectionHeader
              title={STATUS_LABELS.active}
              onAdd={openCreateInUrl}
              addLabel="Создать курс"
            />
            <div className={s.sectionList}>
              {activeCourses.map((course) => (
                <div key={course.id} className={s.cardWrapper}>
                  {editBlockedCourseId === course.id && (
                    <div className={s.inlineError}>
                      Редактирование курса закрывается за 48 часов до первого занятия
                    </div>
                  )}
                  <Card
                    item={course}
                    compact
                    profile
                    largeImage
                    className={s.card}
                    actions={
                      <>
                        <Button
                          mode="dark"
                          className={s.actionBtn}
                          onClick={(e) =>
                            handleEdit(e, course.id, course.canEdit, course.firstLessonAt)
                          }
                        >
                          Редактировать
                        </Button>
                        <button
                          type="button"
                          className={s.cancelBtn}
                          disabled={store.isLoading}
                          onClick={(e) => openCompleteConfirm(e, course.id)}
                        >
                          Отменить курс
                        </button>
                      </>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          {completedCourses.length > 0 && (
            <div className={s.section}>
              <SectionHeader title={STATUS_LABELS.completed} />
              <div className={s.sectionList}>
                {completedCourses.map((course) => (
                  <div key={course.id} className={s.cardWrapper} data-completed>
                    <Card item={course} compact profile largeImage className={s.card} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {cancelledCourses.length > 0 && (
            <div className={s.section}>
              <SectionHeader title={STATUS_LABELS.cancelled} />
              <div className={s.sectionList}>
                {cancelledCourses.map((course) => (
                  <div key={course.id} className={s.cardWrapper} data-completed>
                    <Card item={course} compact profile largeImage className={s.card} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default observer(TeacherCourses);
