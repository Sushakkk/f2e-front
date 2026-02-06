import { observer } from 'mobx-react';
import * as React from 'react';

import s from './MapPage.module.scss';

const MapPage: React.FC = () => {
  return (
    <div className={s.page}>
      <h1 className={s.title}>Карта</h1>
    </div>
  );
};

export default observer(MapPage);
