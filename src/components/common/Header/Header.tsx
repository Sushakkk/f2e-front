import cn from 'classnames';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { RoutePath } from 'config/router/paths';

import s from './Header.module.scss';
import { Notifications } from './Notifications';
import { HEADER_NAV } from './config';

const Header: React.FC = () => {
  const location = useLocation();
  const homeTarget = React.useMemo(() => {
    const from = (location.state as { from?: string } | null)?.from;

    if (typeof from === 'string' && (from === RoutePath.home || from.startsWith(`${RoutePath.home}?`))) {
      return from;
    }

    return RoutePath.home;
  }, [location.state]);

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <NavLink className={s.logo} to={homeTarget}>
          FiveToEight
        </NavLink>
        <nav className={s.nav}>
          {HEADER_NAV.map(({ id, label, to, end, activePathPrefix }) => (
            <NavLink
              key={id}
              className={({ isActive }) => {
                let navActive = isActive;

                if (activePathPrefix !== undefined) {
                  navActive =
                    location.pathname === activePathPrefix ||
                    location.pathname.startsWith(`${activePathPrefix}/`);
                }

                return cn(s.link, navActive && s.linkActive);
              }}
              to={id === 'home' ? homeTarget : to}
              end={end}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Notifications />
      </div>
    </header>
  );
};

export default React.memo(Header);
