import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Navigate, generatePath, useNavigate, useParams } from 'react-router-dom';

import Button from 'components/common/Button/Button';
import { InfoPage } from 'components/common/InfoPage';
import { Row } from 'components/common/Row';
import { CourseActivityStatus } from 'config';
import { ENDPOINTS } from 'config/api';
import { RoutePath } from 'config/router/paths';
import type { EnrollmentStatus } from 'config/users';
import type { CourseDetailServer } from 'entities/course/server';
import { MockDb } from 'services/mockDb';
import { CourseStore } from 'store/CourseStore';
import type { ErrorResponse } from 'store/globals/api/types';
import { useRootStore } from 'store/globals/root';
import { useUserStore } from 'store/hooks';
import { useLocalStore } from 'store/hooks/useLocalStore';
import { getScheduleLines } from 'utils/scheduleUtils';

import s from './CoursePage.module.scss';

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const rootStore = useRootStore();
  const userStore = useUserStore();
  const navigate = useNavigate();

  const courseStore = useLocalStore(() => new CourseStore(rootStore));
  const [enrolling, setEnrolling] = React.useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = React.useState<EnrollmentStatus | null>(null);
  const numericCourseId = Number(id);

  React.useEffect(() => {
    if (!Number.isFinite(numericCourseId) || numericCourseId <= 0) {
      return;
    }

    void courseStore.loadCourse(numericCourseId);
  }, [courseStore, numericCourseId]);

  const courseData = courseStore.course;

  const isLoggedIn = Boolean(userStore.user);

  const isEnrolled = React.useMemo(
    () => enrollmentStatus === 'active' || enrollmentStatus === 'pending',
    [enrollmentStatus]
  );

  const isFavorite = React.useMemo(
    () => (courseData ? MockDb.isCourseFavorite(courseData.id) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courseData, userStore.user]
  );

  const scheduleLines = React.useMemo(
    () => (courseData ? getScheduleLines(courseData) : []),
    [courseData]
  );

  const locationsFromSchedule = React.useMemo(
    () => [...new Set(scheduleLines.map((l) => l.location).filter(Boolean))] as string[],
    [scheduleLines]
  );

  const handleEnroll = React.useCallback(async () => {
    if (!isLoggedIn) {
      navigate(RoutePath.auth);

      return;
    }

    if (!courseData || enrolling) {
      return;
    }

    setEnrolling(true);
    const response = await rootStore.apiStore
      .createExtendedRequest<CourseDetailServer, ErrorResponse>({
        ...ENDPOINTS.courses.enroll(courseData.id, 'POST'),
        showExpectedError: false,
        showUnexpectedError: true,
      })
      .call();

    if (!response.isError) {
      setEnrollmentStatus(response.data.status === 'completed' ? 'completed' : 'active');
      void courseStore.loadCourse(courseData.id);
      void rootStore.coursesStore.loadCourses();
      void rootStore.notificationsStore.load();
    }

    setEnrolling(false);
  }, [courseStore, courseData, enrolling, isLoggedIn, navigate, rootStore]);

  const handleCancel = React.useCallback(async () => {
    if (!courseData || enrolling) {
      return;
    }

    setEnrolling(true);
    const response = await rootStore.apiStore
      .createExtendedRequest<void, ErrorResponse>({
        ...ENDPOINTS.courses.enroll(courseData.id, 'DELETE'),
        showExpectedError: false,
        showUnexpectedError: true,
      })
      .call();

    if (!response.isError) {
      setEnrollmentStatus('cancelled');
      void courseStore.loadCourse(courseData.id);
      void rootStore.coursesStore.loadCourses();
      void rootStore.notificationsStore.load();
    }

    setEnrolling(false);
  }, [courseStore, courseData, enrolling, rootStore]);

  const goToTeacher = React.useCallback(
    (teacherId?: number) => {
      if (!teacherId) {
        return;
      }

      navigate(generatePath(RoutePath.teacher, { id: String(teacherId) }));
    },
    [navigate]
  );

  const handleToggleFavorite = React.useCallback(() => {
    if (!isLoggedIn) {
      navigate(RoutePath.auth);

      return;
    }

    if (!courseData) {
      return;
    }

    MockDb.toggleFavoriteCourse(courseData.id);
    userStore.refreshUser();
  }, [isLoggedIn, courseData, navigate, userStore]);

  React.useEffect(() => {
    if (!isLoggedIn || !courseData) {
      setEnrollmentStatus(null);

      return undefined;
    }

    let cancelled = false;

    const loadEnrollmentStatus = async (): Promise<void> => {
      const response = await rootStore.apiStore
        .createExtendedRequest<
          { course: { id: number }; status: EnrollmentStatus }[],
          ErrorResponse
        >({
          ...ENDPOINTS.myCourses,
          showExpectedError: false,
          showUnexpectedError: false,
        })
        .call();

      if (cancelled || response.isError) {
        return;
      }

      const row = response.data.find((e) => e.course.id === courseData.id);

      setEnrollmentStatus(row?.status ?? null);
    };

    void loadEnrollmentStatus();

    return () => {
      cancelled = true;
    };
  }, [courseData, isLoggedIn, rootStore]);

  const handleEnrollClick = React.useCallback(() => {
    if (isEnrolled) {
      void handleCancel();
    } else {
      void handleEnroll();
    }
  }, [isEnrolled, handleCancel, handleEnroll]);

  if (!id || !Number.isFinite(numericCourseId) || numericCourseId <= 0) {
    return <Navigate to={RoutePath.root} />;
  }

  if (courseStore.loadError) {
    return <Navigate to={RoutePath.root} />;
  }

  if (!courseData) {
    return <div>Загрузка курса...</div>;
  }

  const scheduleLength = scheduleLines.length;
  const musicLabel = [courseData.music.artist, courseData.music.track].filter(Boolean).join(' — ');
  const hasMusic = Boolean(musicLabel || courseData.music.url);
  const isCourseCompleted =
    (courseData.activityStatus ?? CourseActivityStatus.Active) === CourseActivityStatus.Completed;

  return (
    <InfoPage
      title={courseData.name}
      description={courseData.description}
      images={courseData.images}
      liked={isFavorite}
      onToggleLike={handleToggleFavorite}
      button={
        isCourseCompleted ? undefined : (
          <Button
            mode={isEnrolled ? 'dark' : 'purple'}
            className={s.enrollBtn}
            onClick={handleEnrollClick}
            disabled={enrolling}
          >
            {enrolling ? 'Загрузка...' : isEnrolled ? 'Отменить запись' : 'Записаться'}
          </Button>
        )
      }
    >
      <Row label="Преподаватель:" accent>
        <div
          className={cn(s.text, s.text_accent)}
          onClick={() => goToTeacher(courseData.teacher.id)}
        >
          {courseData.teacher.name}
        </div>
      </Row>
      <Row label="Направление:">{courseData.type}</Row>
      <Row label="Уровень:">{courseData.level}</Row>
      {courseData.city && <Row label="Город:">{courseData.city}</Row>}
      {courseData.dateFrom && courseData.dateTo && (
        <Row label="Дата:">
          {courseData.dateFrom}-{courseData.dateTo}
        </Row>
      )}
      {scheduleLength > 0 && (
        <Row label="Расписание:">
          {scheduleLines.map((line, i) => (
            <React.Fragment key={i}>
              {line.day} {line.time}
              {scheduleLength > 1 && line.location && ` (${line.location})`}
              {i < scheduleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </Row>
      )}
      {scheduleLength === 1 && <Row label="Место:">{locationsFromSchedule}</Row>}
      <Row label="Студия:">{courseData.studio}</Row>
      <Row label="Количество мест:">
        {courseData.capacity} (осталось {courseData.spotsLeft})
      </Row>
      {hasMusic && (
        <Row label="Музыка:">
          {courseData.music.url ? (
            <a
              href={courseData.music.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(s.text, s.text_accent)}
            >
              {musicLabel || courseData.music.url}
            </a>
          ) : (
            musicLabel
          )}
        </Row>
      )}
      <Row label="Цена:">{courseData.price.toLocaleString()} ₽</Row>
    </InfoPage>
  );
};

export default observer(CoursePage);
