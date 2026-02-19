import { observer } from 'mobx-react';
import * as React from 'react';
import { Navigate, generatePath, useNavigate } from 'react-router-dom';

import Button from 'components/common/Button/Button';
import { COURSES_CONFIG } from 'config/cards';
import { RoutePath } from 'config/router/paths';
import { useUserStore } from 'store/hooks';

import s from './ProfilePage.module.scss';

const ProfilePage: React.FC = () => {
  const userStore = useUserStore();
  const navigate = useNavigate();

  const user = userStore.user;

  const activeEnrollments = React.useMemo(
    () => (user?.enrollments ?? []).filter((e) => e.status === 'active'),
    [user?.enrollments]
  );

  const completedEnrollments = React.useMemo(
    () => (user?.enrollments ?? []).filter((e) => e.status === 'completed'),
    [user?.enrollments]
  );

  const favoriteCourses = React.useMemo(
    () =>
      (user?.favoriteCourseIds ?? [])
        .map((id) => COURSES_CONFIG.find((c) => c.id === id))
        .filter(Boolean),
    [user?.favoriteCourseIds]
  );

  const goToCourse = React.useCallback(
    (courseId: number) => {
      navigate(generatePath(RoutePath.course, { id: String(courseId) }));
    },
    [navigate]
  );

  const goToTeacher = React.useCallback(
    (teacherName: string) => {
      navigate(generatePath(RoutePath.teacher, { name: encodeURIComponent(teacherName) }));
    },
    [navigate]
  );

  const handleLogout = React.useCallback(() => {
    userStore.logout();
    navigate(RoutePath.home);
  }, [userStore, navigate]);

  if (!user) {
    return <Navigate to={RoutePath.auth} replace />;
  }

  const favoriteTeachers = user.favoriteTeacherNames ?? [];

  return (
    <div className={s.page}>
      <h1 className={s.title}>Профиль</h1>
      <div className={s.section}>
        <div className={s.userInfo}>
          {user.avatar && <img className={s.avatar} src={user.avatar} alt="Аватар" />}
          <div className={s.userDetails}>
            <div className={s.userName}>
              {user.firstName} {user.lastName}
            </div>
            <div className={s.userMeta}>{user.email}</div>
            {user.phone && <div className={s.userMeta}>{user.phone}</div>}
            {user.city && <div className={s.userMeta}>{user.city}</div>}
            <div className={s.userMeta}>Уровень: {user.level}</div>
          </div>
        </div>
      </div>
      {activeEnrollments.length > 0 && (
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Активные курсы</h2>
          <div className={s.list}>
            {activeEnrollments.map((e) => {
              const course = COURSES_CONFIG.find((c) => c.id === e.courseId);

              if (!course) {
                return null;
              }

              return (
                <div key={e.courseId} className={s.listItem} onClick={() => goToCourse(course.id)}>
                  <span className={s.listItemName}>{course.name}</span>
                  <span className={s.listItemMeta}>
                    {course.type} &middot; {course.dateFrom}–{course.dateTo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {completedEnrollments.length > 0 && (
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Завершённые курсы</h2>
          <div className={s.list}>
            {completedEnrollments.map((e) => {
              const course = COURSES_CONFIG.find((c) => c.id === e.courseId);

              if (!course) {
                return null;
              }

              return (
                <div key={e.courseId} className={s.listItem} onClick={() => goToCourse(course.id)}>
                  <span className={s.listItemName}>{course.name}</span>
                  <span className={s.listItemMeta}>{course.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {favoriteCourses.length > 0 && (
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Избранные курсы</h2>
          <div className={s.list}>
            {favoriteCourses.map((course) => (
              <div key={course!.id} className={s.listItem} onClick={() => goToCourse(course!.id)}>
                <span className={s.listItemName}>{course!.name}</span>
                <span className={s.listItemMeta}>{course!.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {favoriteTeachers.length > 0 && (
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Избранные преподаватели</h2>
          <div className={s.list}>
            {favoriteTeachers.map((name) => (
              <div key={name} className={s.listItem} onClick={() => goToTeacher(name)}>
                <span className={s.listItemName}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button mode="dark" className={s.logoutBtn} onClick={handleLogout}>
        Выйти
      </Button>
    </div>
  );
};

export default observer(ProfilePage);
