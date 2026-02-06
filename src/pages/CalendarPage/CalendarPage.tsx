import { observer } from 'mobx-react';
import * as React from 'react';

import s from './CalendarPage.module.scss';

const CalendarPage: React.FC = () => {
  return (
    <div className={s.page}>
      <h1 className={s.title}>Календарь</h1>
    </div>
  );
};

export default observer(CalendarPage);
