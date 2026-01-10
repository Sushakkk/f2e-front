import { LSKey } from 'store/globals/api/types';

declare global {
  type WindowStorageType = {
    [Key in LSKey]: string | null;
  };

  interface Window extends WindowStorageType {
    API_URL_FROM_TEMPLATE: string;
  }
}
