import { observer } from 'mobx-react';
import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Footer, Header, ScreenSpinner } from 'components/common';
import { RoutePath } from 'config/router/paths';
import { useRootStoreInit } from 'store/hooks';

const PAGES_WITH_OWN_LOADER = new Set<string>([RoutePath.map]);

const AppLayout: React.FC = () => {
  const { appState } = useRootStoreInit();
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  if ((appState.initial || appState.loading) && !PAGES_WITH_OWN_LOADER.has(pathname)) {
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
