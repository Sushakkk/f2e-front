import { observer } from 'mobx-react';
import * as React from 'react';

import s from './HomePage.module.scss';

const HomePage: React.FC = () => {
  return <div className={s.page}></div>;
};

export default observer(HomePage);
