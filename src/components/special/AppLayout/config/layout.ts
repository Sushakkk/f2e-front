import { RoutePath } from 'config/router/paths';

export interface LayoutConfig {
  withHeader?: boolean;
}

export const LAYOUT_CONFIG: Record<RoutePath, LayoutConfig> = {
  [RoutePath.root]: {
    withHeader: false,
  },
  [RoutePath.error]: {
    withHeader: false,
  },
  [RoutePath.home]: {
    withHeader: true,
  },
  [RoutePath.calendar]: {
    withHeader: true,
  },
  [RoutePath.map]: {
    withHeader: true,
  },
  [RoutePath.profile]: {
    withHeader: true,
  },
};
