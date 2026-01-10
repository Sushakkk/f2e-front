import { AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation } from 'react-router';
import { useOutlet } from 'react-router-dom';

import { type RoutePath } from 'config/router/paths';
import { useRootStoreInit } from 'store/hooks';

import * as config from './config';
import * as ui from './ui';

const AppLayout: React.FC = () => {
  const { appState } = useRootStoreInit();
  const location = useLocation();
  const outlet = useOutlet();

  const { withHeader } = config.LAYOUT_CONFIG[location.pathname as RoutePath];

  if (appState.loading) {
    return (
      <AnimatePresence mode="popLayout">
        <ui.Loader />
      </AnimatePresence>
    );
  }

  if (withHeader) {
    return (
      <AnimatePresence mode="popLayout">
        <ui.PageWithHeader>{outlet}</ui.PageWithHeader>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <ui.PageWrapper key={location.key}>{outlet}</ui.PageWrapper>
    </AnimatePresence>
  );
};

export default observer(AppLayout);
