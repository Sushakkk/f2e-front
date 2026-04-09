import { RoutePath } from 'config/router/paths';
import { PROFILE_DEFAULT_PATH } from 'config/router/profilePaths';

export type HeaderNavItem = {
  id: string;
  label: string;
  to: string;
  end?: boolean;

  /** Подсветка пункта для всех путей с этим префиксом (например `/profile`) */
  activePathPrefix?: string;
};

export const HEADER_NAV: HeaderNavItem[] = [
  {
    id: 'home',
    label: 'Главная',
    to: RoutePath.root,
    end: true,
  },
  {
    id: 'calendar',
    label: 'Календарь',
    to: RoutePath.calendar,
  },
  {
    id: 'map',
    label: 'Карта',
    to: RoutePath.map,
  },
  {
    id: 'profile',
    label: 'Профиль',
    to: PROFILE_DEFAULT_PATH,
    activePathPrefix: RoutePath.profile,
  },
];
