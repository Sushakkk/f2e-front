export enum StorageType {
  localStorage = 'localStorage',
  sessionStorage = 'sessionStorage',
}

// NOTE: проверка доступности localStorage взята из статьи на MDN
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
export const storageAvailable = (type: StorageType) => {
  let storage;

  try {
    storage = window[type];
    const x = '__storage_test__';

    storage.setItem(x, x);
    storage.removeItem(x);

    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === 'QuotaExceededError' &&
      storage &&
      storage.length !== 0
    );
  }
};
