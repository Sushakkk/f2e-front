import cn from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import s from './Header.module.scss';
import { Notifications } from './Notifications';
import { HEADER_NAV } from './config';

const Header: React.FC = () => {
  return (
    <header className={s.header}>
      <div className={s.logo}>FiveToEight</div>
      <nav className={s.nav}>
        {HEADER_NAV.map(({ id, label, to, end }) => (
          <NavLink
            key={id}
            className={({ isActive }) => cn(s.link, isActive && s.linkActive)}
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
