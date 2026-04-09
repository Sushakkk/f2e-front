import cn from 'classnames';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import s from './Header.module.scss';
import { Notifications } from './Notifications';
import { HEADER_NAV } from './config';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className={s.header}>
      <div className={s.logo}>FiveToEight</div>
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
            to={to}
            end={end}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Notifications />
    </header>
  );
};

export default React.memo(Header);
