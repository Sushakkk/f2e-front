import { LSKey } from 'store/globals/api/types';

import { StorageLikeObject } from '../types';

class WindowStorage implements StorageLikeObject {
  getItem(key: LSKey): string | null {
    return window[key] ?? null;
  }

  setItem(key: LSKey, value: string): void {
    window[key] = value;
  }

  removeItem(key: LSKey): void {
    window[key] = null;
  }
}

export { WindowStorage };
