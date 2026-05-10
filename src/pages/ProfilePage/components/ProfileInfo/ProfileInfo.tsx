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

const ProfileInfoComponent: React.FC<Props> = ({ user, store, onLogout, onRetrySurvey }) => {
  React.useLayoutEffect(() => {
    if (!store.isEditingProfile) {
      return;
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [store.isEditingProfile]);

  const fullName =
    [user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ') || user.username;

  const profileFacts = [
    { label: 'Username', value: `@${user.username}` },
    { label: 'E-mail', value: user.email || 'Не указан' },
    { label: 'Город', value: user.city || 'Не указан' },
    { label: 'Уровень', value: user.level || 'Не указан' },
  ];

  const teacherSpecializations = store.teacherProfileForm.specializations
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  const teacherAchievements = store.teacherProfileForm.achievements
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className={s.root}>
      <ProfileInfoHero user={user} fullName={fullName} />
      {store.isEditingProfile ? (
        <ProfileInfoEdit store={store} />
      ) : (
        <>
          <ProfileInfoView
            store={store}
            profileFacts={profileFacts}
            teacherSpecializations={teacherSpecializations}
            teacherAchievements={teacherAchievements}
          />
          <ProfileInfoActions
            user={user}
            store={store}
            onLogout={onLogout}
            onRetrySurvey={onRetrySurvey}
          />
        </>
      )}
    </div>
  );
};

export const ProfileInfo = observer(ProfileInfoComponent);

export default ProfileInfo;
