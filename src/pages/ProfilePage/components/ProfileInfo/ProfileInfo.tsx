import { observer } from 'mobx-react';
import * as React from 'react';

import type { UserClient } from 'entities/user';
import type { ProfilePageStore } from 'store/ProfilePageStore';

import s from './ProfileInfo.module.scss';
import { ProfileInfoActions, ProfileInfoEdit, ProfileInfoHero, ProfileInfoView } from './ui';

type Props = {
  user: UserClient;
  store: ProfilePageStore;
  onLogout: () => void;
  onRetrySurvey: () => void;
};

const ProfileInfo: React.FC<Props> = ({ user, store, onLogout, onRetrySurvey }) => {
  const fullName = [user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ');
  const teacherSpecializations = store.teacherProfileForm.specializations
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  const teacherAchievements = store.teacherProfileForm.achievements
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  const profileFacts = [
    { label: 'Username', value: `@${user.username}` },
    { label: 'E-mail', value: user.email },
    { label: 'Город', value: user.city || 'Не указан' },
    { label: 'Уровень', value: user.level || 'Не указан' },
  ];

  return (
    <div className={s.root}>
      {!store.isEditingProfile && <ProfileInfoHero user={user} fullName={fullName} />}
      {store.isEditingProfile ? (
        <ProfileInfoEdit store={store} />
      ) : (
        <ProfileInfoView
          store={store}
          profileFacts={profileFacts}
          teacherSpecializations={teacherSpecializations}
          teacherAchievements={teacherAchievements}
        />
      )}
      {!store.isEditingProfile && (
        <ProfileInfoActions
          user={user}
          store={store}
          onLogout={onLogout}
          onRetrySurvey={onRetrySurvey}
        />
      )}
    </div>
  );
};

export default observer(ProfileInfo);
