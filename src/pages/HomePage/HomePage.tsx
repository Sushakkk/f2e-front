import { observer } from 'mobx-react';
import * as React from 'react';

import { Button } from 'components/common';
import { RoutePath } from 'config/router/paths';
import { useRouterStore } from 'store/hooks';

import s from './HomePage.module.scss';

const HomePage: React.FC = () => {
  const { replace } = useRouterStore();

  return (
    <div className={s['home-page']}>
      <h1 className={s.title}>HOME</h1>
      <div className={s.controls}>
        <Button onClick={() => replace(RoutePath.onboarding)}>Open Onboarding</Button>
      </div>
    </div>
  );
};

export default observer(HomePage);
