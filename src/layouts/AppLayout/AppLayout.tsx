import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { Footer, Header } from 'components/common';

const AppLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default React.memo(AppLayout);
