import { observer } from 'mobx-react';
import * as React from 'react';

import s from './AboutPage.module.scss';

const AboutPage: React.FC = () => {
  return (
    <div className={s['about-page']}>
      <h1 className={s.title}>ABOUT</h1>
    </div>
  );
};

export default observer(AboutPage);
