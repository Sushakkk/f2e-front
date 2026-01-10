import { storageAvailable, StorageType } from 'utils/storageAvailable';

import { IStorageStore } from './declaration';
import { WindowStorage } from './storages';

export default class StorageStore implements IStorageStore {
  storage: Storage | WindowStorage;
  getItem: (typeof this.storage)['getItem'];
  setItem: (typeof this.storage)['setItem'];
  removeItem: (typeof this.storage)['removeItem'];

  constructor() {
    if (storageAvailable(StorageType.localStorage)) {
      this.storage = localStorage;
    } else if (storageAvailable(StorageType.sessionStorage)) {
      this.storage = sessionStorage;
    } else {
      this.storage = new WindowStorage();
    }

    this.getItem = this.storage.getItem.bind(this.storage);
    this.setItem = this.storage.setItem.bind(this.storage);
    this.removeItem = this.storage.removeItem.bind(this.storage);
  }
}
