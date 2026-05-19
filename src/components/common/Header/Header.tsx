import cn from 'classnames';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { RoutePath } from 'config/router/paths';
import { AppTheme, getStoredTheme, setTheme } from 'utils/theme';

import s from './Header.module.scss';
import { Notifications } from './Notifications';
import { HEADER_NAV } from './config';

const Header: React.FC = () => {
  const location = useLocation();
  const [theme, updateTheme] = React.useState<AppTheme>(() => getStoredTheme());

  const handleLogoClick = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<AppTheme>).detail;

      if (nextTheme === 'dark' || nextTheme === 'light') {
        updateTheme(nextTheme);
      }
    };

    window.addEventListener('app-theme-change', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('app-theme-change', handleThemeChange as EventListener);
    };
  }, []);

  const handleThemeToggle = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <NavLink className={s.logo} to={RoutePath.home} onClick={handleLogoClick}>
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
              to={id === 'home' ? RoutePath.home : to}
              end={end}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={s.actions}>
          <button
            type="button"
            className={s.themeToggle}
            onClick={handleThemeToggle}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? 'Светлая' : 'Тёмная'}
          </button>
          <Notifications />
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
