import { observer } from 'mobx-react';
import * as React from 'react';

// DEMO: svg as image & svg as react-component
// eslint-disable-next-line import/no-duplicates
import logoImg from 'assets/images/logo.svg';
// eslint-disable-next-line import/no-duplicates
import LogoComponent from 'assets/images/logo.svg?react';
import { Button } from 'components/common';
import { RoutePath } from 'config/router/paths';
import { useRouterStore } from 'store/hooks';

import s from './OnboardingPage.module.scss';

const OnboardingPage: React.FC = () => {
  const { replace } = useRouterStore();

  return (
    <div className={s['onboarding-page']}>
      <div>
        <img src={logoImg} alt="logo" className={s.logo} />
        <LogoComponent className={s.logo} />
      </div>
      <h1 className={s.title}>ONBOARDING</h1>
      <Button onClick={() => replace(RoutePath.home)}>Next</Button>
    </div>
  );
};

export default observer(OnboardingPage);
