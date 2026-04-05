import { IGlobalStore } from 'store/interfaces';

import type { DanceStyle } from './types';

export interface IDanceStylesStore extends IGlobalStore {
  styles: DanceStyle[];
  isLoading: boolean;
  options: { value: string; label: string }[];
  requestDanceStyles: () => Promise<DanceStyle[]>;
}
