import { type IRootStore } from 'store/globals/root/declaration';

export interface IGlobalStore {
  readonly rootStore: IRootStore;

  init: (...args: any[]) => Promise<boolean>;

  destroy: VoidFunction;
}
