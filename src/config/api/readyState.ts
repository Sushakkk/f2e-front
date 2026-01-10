import { ENDPOINTS } from './endpoints';

// TODO: Обновлять состояние готовности по эндпойнтам
export const API_READY_STATE: Record<keyof typeof ENDPOINTS, boolean> = {
  auth: false,
  flag: false,
  restart: false,
  getUser: false,
};
