import { observer } from 'mobx-react';
import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { Footer, Header, ScreenSpinner } from 'components/common';
import { useRootStoreInit } from 'store/hooks';

const AppLayout: React.FC = () => {
  const { appState } = useRootStoreInit();

  if (appState.initial || appState.loading) {
    return <ScreenSpinner />;
  }

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default observer(AppLayout);
