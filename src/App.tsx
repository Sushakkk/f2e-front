import * as React from 'react';
import { RouterProvider } from 'react-router-dom';

import { ScreenSpinner } from 'components/common';
import { ROUTER } from 'config/router';
import { RootStoreProvider } from 'store/globals/root';

const App: React.FC = () => (
  <RootStoreProvider>
    <RouterProvider
      router={ROUTER}
      fallbackElement={<ScreenSpinner />}
      future={{
        // https://reactrouter.com/en/6.20.0/guides/api-development-strategy#react-router-future-flags
        ['v7_startTransition']: true,
      }}
    />
  </RootStoreProvider>
);

export default App;
