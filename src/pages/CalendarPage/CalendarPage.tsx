import { observer } from 'mobx-react';
import * as React from 'react';
import { Navigate } from 'react-router-dom';

import { RoutePath } from 'config/router/paths';
import { useUserStore } from 'store/hooks';

import s from './CalendarPage.module.scss';
import CalendarContent from './CalendarContent';

const CalendarPage: React.FC = () => {
  const userStore = useUserStore();

  if (!userStore.user) {
    return <Navigate to={RoutePath.auth} replace />;
  }

  return (
    <div className={s.page}>
      <CalendarContent showTitle />
    </div>
  );
};

export default observer(CalendarPage);
