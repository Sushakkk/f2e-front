import cn from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import s from './Footer.module.scss';
import { FOOTER_NAV } from './config';

export const Footer: React.FC = () => {
  return (
    <footer className={s.root}>
      {FOOTER_NAV.map(({ id, label, to, end, Icon }) => (
        <NavLink key={id} className={s.item} aria-label={label} to={to} end={end}>
          {({ isActive }) => <Icon className={cn(s.icon, isActive && s.iconActive)} />}
        </NavLink>
      ))}
    </footer>
  );
};

export default React.memo(Footer);
