import { RoutePath } from 'config/router/paths';

export type HeaderNavItem = {
  id: string;
  label: string;
  to: string;
  end?: boolean;
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
    to: RoutePath.profile,
  },
];
