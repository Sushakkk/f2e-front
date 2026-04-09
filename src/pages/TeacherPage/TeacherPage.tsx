import { observer } from 'mobx-react';
import * as React from 'react';
import { Navigate, generatePath, useNavigate, useParams } from 'react-router-dom';

import { InfoPage } from 'components/common/InfoPage';
import { Row } from 'components/common/Row';
import { StarRating } from 'components/common/StarRating';
import { RoutePath } from 'config/router/paths';
import { TeacherStore } from 'store/TeacherStore';
import { useRootStore } from 'store/globals/root';
import { useUserStore } from 'store/hooks';
import { useLocalStore } from 'store/hooks/useLocalStore';

import s from './TeacherPage.module.scss';
import { ReviewsSection } from './components';

const TeacherPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const rootStore = useRootStore();
  const userStore = useUserStore();
  const navigate = useNavigate();
  const teacherStore = useLocalStore(() => new TeacherStore(rootStore));

  const teacherId = Number(id);
  const isLoggedIn = Boolean(userStore.user);

  React.useEffect(() => {
    if (!Number.isFinite(teacherId) || teacherId <= 0) {
      return;
    }

    void teacherStore.loadTeacher(teacherId);
  }, [teacherId, teacherStore]);

  const teacher = teacherStore.teacher;
  const isFavorite = Boolean(teacher && userStore.user?.favoriteTeacherIds?.includes(teacher.id));

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

    void teacherStore.toggleFavorite(isFavorite);
  }, [isFavorite, isLoggedIn, teacher, navigate, teacherStore]);

  if (!id || !Number.isFinite(teacherId) || teacherId <= 0) {
    return <Navigate to={RoutePath.root} />;
  }

  if (teacherStore.loadError) {
    return <Navigate to={RoutePath.root} />;
  }

  if (!teacher) {
    return <div>Загрузка преподавателя...</div>;
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
      {teacher.city && <Row label="Город:">{teacher.city}</Row>}
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
      {teacher.courses.length > 0 && (
        <Row label="Курсы:">
          {teacher.courses.map((course, i) => (
            <React.Fragment key={course.id}>
              <span className={s.courseLink} onClick={() => goToCourse(course.id)}>
                {course.name}
              </span>
              {i < teacher.courses.length - 1 && <br />}
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
