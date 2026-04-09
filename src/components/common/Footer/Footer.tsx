import cn from 'classnames';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import s from './Footer.module.scss';
import { FOOTER_NAV } from './config';

export const Footer: React.FC = () => {
  const location = useLocation();

  return (
    <footer className={s.root}>
      {FOOTER_NAV.map(({ id, label, to, end, activePathPrefix, Icon }) => (
        <NavLink key={id} className={s.item} aria-label={label} to={to} end={end}>
          {({ isActive }) => {
            let navActive = isActive;

            if (activePathPrefix !== undefined) {
              navActive =
                location.pathname === activePathPrefix ||
                location.pathname.startsWith(`${activePathPrefix}/`);
            }

            return <Icon className={cn(s.icon, navActive && s.iconActive)} />;
          }}
        </NavLink>
      ))}
    </footer>
  );
};

export default React.memo(Footer);
