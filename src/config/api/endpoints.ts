import { API_URL } from './apiUrl';
import { EndpointType } from './types';

const createApiEndpoint = (path: string, method: EndpointType['method'] = 'GET'): EndpointType => ({
  url: `${API_URL}${path}`,
  method,
});

export const ENDPOINTS = {
  auth: {
    login: createApiEndpoint('auth/login/', 'POST'),
    register: createApiEndpoint('auth/register/', 'POST'),
    refresh: createApiEndpoint('auth/refresh/', 'POST'),
    logout: createApiEndpoint('auth/logout/', 'POST'),
    user: createApiEndpoint('user/', 'GET'),
    updateUser: createApiEndpoint('user/', 'PATCH'),
    userSurvey: createApiEndpoint('user/survey/', 'PATCH'),
    userPreferences: createApiEndpoint('user/preferences/', 'PATCH'),
    userSkills: createApiEndpoint('user/skills/', 'PUT'),
  },
  dictionaries: {
    cities: createApiEndpoint('cities/', 'GET'),
    danceStyles: createApiEndpoint('dance-styles/', 'GET'),
  },
  flag: createApiEndpoint('user/flag', 'POST'),
  restart: createApiEndpoint('user/restart', 'POST'),
  getUser: createApiEndpoint('user/', 'GET'),

  courses: {
    list: createApiEndpoint('courses/', 'GET'),
    detail: (id: number): EndpointType => createApiEndpoint(`courses/${id}/`, 'GET'),
  },
  teachers: {
    create: createApiEndpoint('teachers/', 'POST'),
    detail: (id: number): EndpointType => createApiEndpoint(`teachers/${id}/`, 'GET'),
    update: (id: number): EndpointType => createApiEndpoint(`teachers/${id}/`, 'PUT'),
  },
} as const;
