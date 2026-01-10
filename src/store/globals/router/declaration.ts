import { type NavigateOptions } from 'react-router';

import { RoutePath } from 'config/router/paths';
import { type IGlobalStore } from 'store/interfaces';

export interface IRouterStore extends IGlobalStore {
  push: (to: RoutePath, options?: NavigateOptions) => void;
  replace: (to: RoutePath, options?: NavigateOptions) => void;
  goBack: () => void;
}
