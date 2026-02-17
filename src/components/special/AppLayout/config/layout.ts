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
    withHeader: false,
  },
  [RoutePath.course]: {
    withHeader: false,
  },
  [RoutePath.calendar]: {
    withHeader: false,
  },
  [RoutePath.map]: {
    withHeader: false,
  },
  [RoutePath.profile]: {
    withHeader: false,
  },
  [RoutePath.teacher]: {
    withHeader: false,
  },
};
