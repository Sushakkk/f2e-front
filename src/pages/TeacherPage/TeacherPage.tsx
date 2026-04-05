import { observer } from 'mobx-react';
import * as React from 'react';
import { Navigate, generatePath, useNavigate, useParams } from 'react-router-dom';

import { InfoPage } from 'components/common/InfoPage';
import { Row } from 'components/common/Row';
import { StarRating } from 'components/common/StarRating';
import { COURSES_CONFIG, CourseConfigItem } from 'config';
import { RoutePath } from 'config/router/paths';
import { MockDb } from 'services/mockDb';
import { useUserStore } from 'store/hooks';

import s from './TeacherPage.module.scss';
import { ReviewsSection } from './components';

const TeacherPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const userStore = useUserStore();
  const navigate = useNavigate();

  const decodedName = name ? decodeURIComponent(name) : '';
  const isLoggedIn = Boolean(userStore.user);

  const teacher = React.useMemo(() => {
    return MockDb.getTeacherProfile(decodedName);
  }, [decodedName]);

  const teacherCourses: CourseConfigItem[] = React.useMemo(
    () => [
      ...COURSES_CONFIG.filter((c) => c.teacher.name === decodedName),
      ...MockDb.getTeacherCoursesByName(decodedName),
    ],
    [decodedName]
  );

  const isFavorite = React.useMemo(
    () => (teacher ? MockDb.isTeacherFavorite(teacher.name) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacher, userStore.user]
  );

  const goToCourse = React.useCallback(
    (courseId: number) => {
      navigate(generatePath(RoutePath.course, { id: String(courseId) }));
    },
    [navigate]
  );

  const handleToggleFavorite = React.useCallback(() => {
    if (!isLoggedIn) {
      navigate(RoutePath.auth);

      return;
    }

    if (!teacher) {
      return;
    }

    MockDb.toggleFavoriteTeacher(teacher.name);
    userStore.refreshUser();
  }, [isLoggedIn, teacher, navigate, userStore]);

  if (!name || !teacher) {
    return <Navigate to={RoutePath.root} />;
  }

  return (
    <InfoPage
      title={teacher.name}
      description={teacher.bio}
      images={teacher.images}
      liked={isFavorite}
      onToggleLike={handleToggleFavorite}
    >
      <Row label="Опыт:">{teacher.experience} лет</Row>
      <Row label="Специализации:">{teacher.specializations.join(', ')}</Row>
      {teacher.achievements.length > 0 && (
        <Row label="Достижения:">
          {teacher.achievements.map((a, i) => (
            <React.Fragment key={i}>
              {a}
              {i < teacher.achievements.length - 1 && <br />}
            </React.Fragment>
          ))}
        </Row>
      )}
      {teacherCourses.length > 0 && (
        <Row label="Курсы:">
          {teacherCourses.map((course, i) => (
            <React.Fragment key={course.id}>
              <span className={s.courseLink} onClick={() => goToCourse(course.id)}>
                {course.name}
              </span>
              {i < teacherCourses.length - 1 && <br />}
            </React.Fragment>
          ))}
        </Row>
      )}
      <div className={s.ratingBlock}>
        <span className={s.sectionTitle}>Рейтинг</span>
        <StarRating rating={teacher.rating} size="lg" />
      </div>
      {teacher.reviews.length > 0 && <ReviewsSection reviews={teacher.reviews} />}
    </InfoPage>
  );
};

export default observer(TeacherPage);
