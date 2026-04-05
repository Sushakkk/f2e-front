import * as React from 'react';

import type { UserClient } from 'entities/user';

import s from './ProfileInfoHero.module.scss';

type Props = {
  user: UserClient;
  fullName: string;
};

export const ProfileInfoHero: React.FC<Props> = ({ user, fullName }) => (
  <div className={s.hero}>
    <div className={s.heroGlow} />
    <div className={s.heroMain}>
      <div className={s.avatarWrap}>
        {user.avatar ? (
          <img className={s.avatar} src={user.avatar} alt="Аватар" />
        ) : (
          <div className={s.avatarFallback}>{(user.firstName || user.username).slice(0, 1)}</div>
        )}
      </div>
      <div className={s.heroText}>
        <div className={s.eyebrow}>Личный кабинет</div>
        <div className={s.userName}>{fullName}</div>
        <div className={s.userMetaRow}>
          <span className={s.metaChip}>@{user.username}</span>
          <span className={s.metaChip}>{user.email}</span>
        </div>
      </div>
    </div>
  </div>
);

export default React.memo(ProfileInfoHero);
