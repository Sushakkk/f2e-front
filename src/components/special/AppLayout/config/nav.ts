import { RoutePath } from 'config/router/paths';

export interface NavConfig {
  path: RoutePath;
  title: string;
}

export const NAV_CONFIGS: NavConfig[] = [
  {
    path: RoutePath.home,
    title: 'Home',
  },
];
