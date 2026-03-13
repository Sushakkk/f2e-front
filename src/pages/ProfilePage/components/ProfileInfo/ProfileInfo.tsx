import { observer } from 'mobx-react';
import * as React from 'react';

import Button from 'components/common/Button/Button';
import type { UserServer } from 'store/globals/user/types';

import s from './ProfileInfo.module.scss';

type Props = {
  user: UserServer;
  onLogout: () => void;
};

const ProfileInfo: React.FC<Props> = ({ user, onLogout }) => {
  return (
    <div className={s.root}>
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
          {user.role === 'teacher' && <div className={s.badge}>Преподаватель</div>}
        </div>
      </div>
      <Button mode="dark" className={s.logoutBtn} onClick={onLogout}>
        Выйти
      </Button>
    </div>
  );
};

export default observer(ProfileInfo);
