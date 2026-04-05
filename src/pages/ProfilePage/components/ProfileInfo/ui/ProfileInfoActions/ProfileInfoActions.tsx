import * as React from 'react';

import Button from 'components/common/Button/Button';
import type { UserClient } from 'entities/user';
import type { ProfilePageStore } from 'store/ProfilePageStore';

import s from './ProfileInfoActions.module.scss';

type Props = {
  user: UserClient;
  store: ProfilePageStore;
  onLogout: () => void;
  onRetrySurvey: () => void;
};

export const ProfileInfoActions: React.FC<Props> = ({ user, store, onLogout, onRetrySurvey }) => (
  <div className={s.actionCard}>
    <div className={s.actions}>
      <Button
        mode="purple"
        className={s.logoutBtn}
        onClick={() =>
          store.startProfileEdit({
            username: user.username,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            avatar: user.avatar,
          })
        }
      >
        Изменить данные
      </Button>
      <Button mode="dark" className={s.logoutBtn} onClick={onRetrySurvey}>
        Перепройти опрос
      </Button>
      <Button mode="dark" className={s.logoutBtn} onClick={onLogout}>
        Выйти
      </Button>
    </div>
  </div>
);

export default React.memo(ProfileInfoActions);
