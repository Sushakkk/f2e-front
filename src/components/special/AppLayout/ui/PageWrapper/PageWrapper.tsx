import cx from 'clsx';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { observer } from 'mobx-react';
import * as React from 'react';

import * as config from 'components/special/AppLayout/config';

import s from './PageWrapper.module.scss';

type Props = DefaultProps & {
  animationConfig?: HTMLMotionProps<'div'>;
};

const PageWrapper = React.forwardRef<HTMLDivElement, Props>(
  ({ className, children, animationConfig = config.FULL_PAGE_ANIMATION_PROPS }, ref) => {
    return (
      <motion.div ref={ref} className={cx(s['full-page'], className)} {...animationConfig}>
        {children}
      </motion.div>
    );
  }
);

export default observer(PageWrapper);
