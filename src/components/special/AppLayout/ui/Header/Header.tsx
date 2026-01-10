import cx from 'clsx';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useLocation, NavLink } from 'react-router-dom';

import { type NavConfig } from 'components/special/AppLayout/config/nav';
import { RoutePath } from 'config/router/paths';

import s from './Header.module.scss';

type Props = PropsWithClassName & {
  navConfigs: NavConfig[];
};

const Header = React.forwardRef<HTMLDivElement, Props>(({ className, navConfigs: nav }, ref) => {
  const { pathname } = useLocation();

  return (
    <div className={cx(s.header, className)} ref={ref}>
      {nav.map((config) => (
        <NavLink to={config.path} key={config.path} className={s['nav-link']}>
          <span className={s['nav-link__title']}>{config.title}</span>
          {(pathname as RoutePath) === config.path && (
            <motion.span layoutId={s['nav-link__back']} className={s['nav-link__back']} />
          )}
        </NavLink>
      ))}
    </div>
  );
});

export default observer(Header);
