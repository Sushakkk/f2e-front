import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { profilePath } from 'config/router/profilePaths';
import type { ProfileSection, ViewMode } from 'store/ProfilePageStore';

import s from './ProfileSidebar.module.scss';

type SidebarItem = {
  id: ProfileSection;
  label: string;
  teacherOnly?: boolean;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'profile', label: 'Персональные данные' },
  { id: 'enrollments', label: 'Мои записи' },
  { id: 'favorites', label: 'Избранное' },
  { id: 'calendar', label: 'Календарь', teacherOnly: true },
  { id: 'teacherCourses', label: 'Мои курсы', teacherOnly: true },
  { id: 'students', label: 'Ученики', teacherOnly: true },
  { id: 'stats', label: 'Статистика', teacherOnly: true },
];

type Props = {
  activeSection: ProfileSection;
  viewMode: ViewMode;
  canSwitchMode: boolean;
  onViewModeChange: (mode: ViewMode) => void;
};

const ProfileSidebar: React.FC<Props> = ({
  activeSection,
  viewMode,
  canSwitchMode,
  onViewModeChange,
}) => {
  const isTeacher = viewMode === 'teacher';
  const items = isTeacher ? SIDEBAR_ITEMS : SIDEBAR_ITEMS.filter((i) => !i.teacherOnly);
  const teacherStart = items.findIndex((i) => i.teacherOnly);

  return (
    <nav className={s.sidebar}>
      {canSwitchMode && (
        <div className={s.toggle}>
          <button
            className={cx(s.toggleBtn, viewMode === 'student' && s.toggleBtn_active)}
            onClick={() => onViewModeChange('student')}
          >
            Ученик
          </button>
          <button
            className={cx(s.toggleBtn, viewMode === 'teacher' && s.toggleBtn_active)}
            onClick={() => onViewModeChange('teacher')}
          >
            Преподаватель
          </button>
        </div>
      )}
      <div className={s.items}>
        {items.map((item, idx) => (
          <React.Fragment key={item.id}>
            {teacherStart === idx && <div className={s.divider} />}
            <Link
              to={profilePath(item.id)}
              className={cx(s.item, s.item_link, activeSection === item.id && s.item_active)}
            >
              {item.label}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default observer(ProfileSidebar);
