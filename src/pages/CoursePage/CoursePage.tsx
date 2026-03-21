import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Navigate, generatePath, useNavigate, useParams } from 'react-router-dom';

import Button from 'components/common/Button/Button';
import { InfoPage } from 'components/common/InfoPage';
import { Row } from 'components/common/Row';
import { RoutePath } from 'config/router/paths';
import { MockDb } from 'services/mockDb';
import { useUserStore } from 'store/hooks';
import { getScheduleLines } from 'utils/scheduleUtils';

import s from './CoursePage.module.scss';

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userStore = useUserStore();
  const navigate = useNavigate();

  const [courseData, setCourseData] = React.useState(() => MockDb.getCourse(Number(id)));
  const [enrolling, setEnrolling] = React.useState(false);

  const isLoggedIn = Boolean(userStore.user);

  const isEnrolled = React.useMemo(
    () => (courseData ? MockDb.isEnrolled(courseData.id) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courseData, userStore.user]
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
    await MockDb.enrollInCourse(courseData.id);
    userStore.refreshUser();
    setCourseData(MockDb.getCourse(courseData.id));
    setEnrolling(false);
  }, [isLoggedIn, courseData, enrolling, navigate, userStore]);

  const handleCancel = React.useCallback(async () => {
    if (!courseData || enrolling) {
      return;
    }

    setEnrolling(true);
    await MockDb.cancelEnrollment(courseData.id);
    userStore.refreshUser();
    setCourseData(MockDb.getCourse(courseData.id));
    setEnrolling(false);
  }, [courseData, enrolling, userStore]);

  const goToTeacher = React.useCallback(
    (teacherName: string) => {
      navigate(generatePath(RoutePath.teacher, { name: encodeURIComponent(teacherName) }));
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

  const handleEnrollClick = React.useCallback(() => {
    void (isEnrolled ? handleCancel() : handleEnroll());
  }, [isEnrolled, handleCancel, handleEnroll]);

  if (!id || !courseData) {
    return <Navigate to={RoutePath.root} />;
  }

  const scheduleLength = scheduleLines.length;

  return (
    <InfoPage
      title={courseData.name}
      description={courseData.description}
      images={courseData.images}
      liked={isFavorite}
      onToggleLike={handleToggleFavorite}
      button={
        <Button
          mode={isEnrolled ? 'dark' : 'purple'}
          className={s.enrollBtn}
          onClick={handleEnrollClick}
          disabled={enrolling}
        >
          {enrolling ? 'Загрузка...' : isEnrolled ? 'Отменить запись' : 'Записаться'}
        </Button>
      }
    >
      <Row label="Преподаватель:" accent>
        <div
          className={cn(s.text, s.text_accent)}
          onClick={() => goToTeacher(courseData.teacher.name)}
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
      <Row label="Музыка:">
        <a
          href={courseData.music.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(s.text, s.text_accent)}
        >
          {courseData.music.artist} — {courseData.music.track}
        </a>
      </Row>
      <Row label="Цена:">{courseData.price.toLocaleString()} ₽</Row>
    </InfoPage>
  );
};

export default observer(CoursePage);
