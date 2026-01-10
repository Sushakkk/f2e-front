import { observer } from 'mobx-react';
import * as React from 'react';

import s from './ScreenSpinner.module.scss';

const ScreenSpinner: React.FC = () => {
  return (
    <div className={s.screen}>
      <div className={s.spinner} />
    </div>
  );
};

export default observer(ScreenSpinner);
