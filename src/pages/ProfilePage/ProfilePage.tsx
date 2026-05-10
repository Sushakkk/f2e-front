import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Navigate, generatePath, useNavigate, useParams } from 'react-router-dom';

import { Title } from 'components/common';
import { RoutePath } from 'config/router/paths';
import {
  PROFILE_DEFAULT_PATH,
  TEACHER_ONLY_PROFILE_SECTIONS,
  profilePath,
  profileSectionFromSlug,
} from 'config/router/profilePaths';
import type { Enrollment } from 'config/users';
import { UserRole } from 'entities/user';
import CalendarContent from 'pages/CalendarPage/CalendarContent';
import { ProfilePageStore, type ViewMode } from 'store/ProfilePageStore';
import { useRootStore } from 'store/globals/root';
import { useLocalStore, useUserStore } from 'store/hooks';

import s from './ProfilePage.module.scss';
import Favorites from './components/Favorites/Favorites';
import ProfileInfo from './components/ProfileInfo/ProfileInfo';
import ProfileSidebar from './components/ProfileSidebar/ProfileSidebar';
import StudentEnrollments from './components/StudentEnrollments/StudentEnrollments';
import TeacherCourses from './components/TeacherCourses/TeacherCourses';
import TeacherStats from './components/TeacherStats/TeacherStats';
import TeacherStudents from './components/TeacherStudents/TeacherStudents';

const SECTION_TITLES: Record<string, string> = {
  profile: 'Персональные данные',
  enrollments: 'Мои записи',
  favorites: 'Избранное',
  calendar: 'Календарь',
  teacherCourses: 'Мои курсы',
  students: 'Ученики',
  stats: 'Статистика',
};

const MOCK_ENROLLMENTS: Enrollment[] = [
  { courseId: 1, enrolledAt: '2025-05-28', status: 'active', paid: true },
  { courseId: 3, enrolledAt: '2025-02-01', status: 'active', paid: true },
  { courseId: 8, enrolledAt: '2025-02-10', status: 'active', paid: true },
  { courseId: 5, enrolledAt: '2024-12-15', status: 'completed', paid: true },
  { courseId: 4, enrolledAt: '2024-11-20', status: 'completed', paid: true },
];

const MOCK_FAVORITE_COURSES = [1, 3, 10];
const MOCK_FAVORITE_TEACHERS = ['Карпова Ксения', 'Кузнецов Артём', 'Смирнова Анна'];
const MOCK_FAVORITE_TEACHER_IDS = [1, 2, 3];

const ProfilePage: React.FC = () => {
  const rootStore = useRootStore();
  const userStore = useUserStore();
  const navigate = useNavigate();
  const { section: sectionSlug } = useParams<{ section: string }>();
  const store = useLocalStore(() => new ProfilePageStore(rootStore));

  const user = userStore.user;
  const sectionFromUrl = profileSectionFromSlug(sectionSlug);

  React.useLayoutEffect(() => {
    if (sectionFromUrl && store.activeSection !== sectionFromUrl) {
      store.setSection(sectionFromUrl);
    }
  }, [sectionFromUrl, store]);

  React.useEffect(() => {
    if (sectionFromUrl !== 'teacherCourses' && store.isFormOpen) {
      store.closeForm();
    }
  }, [sectionFromUrl, store]);

  React.useEffect(() => {
    if (sectionFromUrl === 'enrollments') {
      void store.loadEnrollments();
    }
  }, [sectionFromUrl, store]);

  React.useEffect(() => {
    if (sectionFromUrl === 'favorites') {
      void rootStore.coursesStore.loadCourses();
    }
  }, [rootStore.coursesStore, sectionFromUrl]);

  React.useEffect(() => {
    if (
      !store.isTeacherView ||
      (sectionFromUrl !== 'calendar' &&
        sectionFromUrl !== 'teacherCourses' &&
        sectionFromUrl !== 'students' &&
        sectionFromUrl !== 'stats')
    ) {
      return;
    }

    void store.loadTeacherCourses(store.mockTeacherId);

    if (sectionFromUrl === 'teacherCourses') {
      void store.loadReferenceData();
    }
  }, [sectionFromUrl, store]);

  const goToTeacher = React.useCallback(
    (teacherId: number) => {
      navigate(generatePath(RoutePath.teacher, { id: String(teacherId) }));
    },
    [navigate]
  );

  const handleLogout = React.useCallback(() => {
    userStore.logout();
    navigate(RoutePath.home);
  }, [userStore, navigate]);

  const handleRetrySurvey = React.useCallback(() => {
    navigate(RoutePath.survey);
  }, [navigate]);

  const handleViewModeChange = React.useCallback(
    (mode: ViewMode) => {
      store.setViewMode(mode);
      navigate(profilePath('profile'));
    },
    [navigate, store]
  );

  if (!user) {
    return <Navigate to={RoutePath.auth} replace />;
  }

  if (!sectionSlug || !sectionFromUrl) {
    return <Navigate to={PROFILE_DEFAULT_PATH} replace />;
  }

  if (TEACHER_ONLY_PROFILE_SECTIONS.includes(sectionFromUrl) && !store.isTeacherView) {
    return <Navigate to={PROFILE_DEFAULT_PATH} replace />;
  }

  const isMockUser = Boolean(user.registeredAt);
  const enrollments =
    store.enrollments.length > 0
      ? store.enrollments
      : isMockUser
        ? user.enrollments ?? MOCK_ENROLLMENTS
        : user.enrollments ?? [];
  const favCourses = isMockUser
    ? user.favoriteCourseIds ?? MOCK_FAVORITE_COURSES
    : user.favoriteCourseIds ?? [];
  const favTeachers = isMockUser
    ? user.favoriteTeacherNames ?? MOCK_FAVORITE_TEACHERS
    : user.favoriteTeacherNames ?? [];
  const favTeacherIds = isMockUser
    ? user.favoriteTeacherIds ?? MOCK_FAVORITE_TEACHER_IDS
    : user.favoriteTeacherIds ?? [];

  const renderContent = () => {
    switch (store.activeSection) {
      case 'profile':
        return (
          <ProfileInfo
            user={user}
            store={store}
            onLogout={handleLogout}
            onRetrySurvey={handleRetrySurvey}
          />
        );

      case 'enrollments':
        return <StudentEnrollments enrollments={enrollments} />;

      case 'favorites':
        return (
          <Favorites
            favoriteCourseIds={favCourses}
            favoriteTeacherIds={favTeacherIds}
            favoriteTeacherNames={favTeachers}
            courses={rootStore.coursesStore.courses}
            onTeacherClick={goToTeacher}
          />
        );

      case 'calendar':
        if (!store.isTeacherView) {
          return null;
        }

        return <CalendarContent />;

      case 'teacherCourses':
        if (!store.isTeacherView) {
          return null;
        }

        return <TeacherCourses store={store} teacherId={store.mockTeacherId} />;

      case 'students':
        if (!store.isTeacherView) {
          return null;
        }

        return <TeacherStudents store={store} />;

      case 'stats':
        if (!store.isTeacherView) {
          return null;
        }

        return <TeacherStats store={store} />;

      default:
        return null;
    }
  };

  return (
    <div className={s.page}>
      <ProfileSidebar
        activeSection={store.activeSection}
        viewMode={store.viewMode}
        canSwitchMode={user.role === UserRole.teacher}
        onViewModeChange={handleViewModeChange}
      />
      <div className={store.activeSection === 'calendar' ? cx(s.content, s.content_calendar) : s.content}>
        {store.activeSection !== 'calendar' && <Title>{SECTION_TITLES[store.activeSection]}</Title>}
        {renderContent()}
      </div>
    </div>
  );
};

export default observer(ProfilePage);
