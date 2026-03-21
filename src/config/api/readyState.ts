import { ENDPOINTS } from './endpoints';

export const API_READY_STATE: Record<keyof typeof ENDPOINTS, boolean> = {
  auth: false,
  flag: false,
  restart: false,
  getUser: false,
  courses: true,
};
