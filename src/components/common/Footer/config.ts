import * as React from 'react';

import { RoutePath } from 'config/router/paths';

import CalendarIcon from './img/calendar.svg?react';
import HomeIcon from './img/home.svg?react';
import MapIcon from './img/map.svg?react';
import ProfileIcon from './img/profile.svg?react';

export type FooterNavItem = {
  id: string;
  label: string;
  to: string;
  end?: boolean;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

export const FOOTER_NAV: FooterNavItem[] = [
  {
    id: 'home',
    label: 'Главная',
    to: RoutePath.root,
    end: true,
    Icon: HomeIcon,
  },
  {
    id: 'calendar',
    label: 'Календарь',
    to: RoutePath.calendar,
    Icon: CalendarIcon,
  },
  {
    id: 'map',
    label: 'Карта',
    to: RoutePath.map,
    Icon: MapIcon,
  },
  {
    id: 'profile',
    label: 'Профиль',
    to: RoutePath.profile,
    Icon: ProfileIcon,
  },
];
