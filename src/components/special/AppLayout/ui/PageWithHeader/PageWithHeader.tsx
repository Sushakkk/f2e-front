import cx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import * as config from 'components/special/AppLayout/config';

import { Header } from '../Header';
import { PageWrapper } from '../PageWrapper';

import s from './PageWithHeader.module.scss';

type Props = DefaultProps;

const PageWithHeader = React.forwardRef<HTMLDivElement, Props>(({ className, children }, ref) => {
  const location = useLocation();

  return (
    <PageWrapper>
      <AnimatePresence mode="popLayout">
        <Header navConfigs={config.NAV_CONFIGS} />
        <motion.div
          key={location.key}
          ref={ref}
          className={cx(s.page, className)}
          {...config.PAGE_ANIMATION_PROPS}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
});

export default observer(PageWithHeader);
