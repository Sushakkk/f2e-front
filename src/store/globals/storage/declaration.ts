import { StorageLikeObject } from './types';

export interface IStorageStore {
  storage: StorageLikeObject;

  getItem: StorageLikeObject['getItem'];
  setItem: StorageLikeObject['setItem'];
  removeItem: StorageLikeObject['removeItem'];
}
