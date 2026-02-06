import { observer } from 'mobx-react';
import * as React from 'react';

import s from './ProfilePage.module.scss';

const ProfilePage: React.FC = () => {
  return (
    <div className={s.page}>
      <h1 className={s.title}>Профиль</h1>
    </div>
  );
};

export default observer(ProfilePage);
