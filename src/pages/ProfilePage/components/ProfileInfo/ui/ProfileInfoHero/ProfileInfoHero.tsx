import * as React from 'react';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
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
        <img className={s.avatar} src={user.avatar || fallbackImage} alt="Аватар" />
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
