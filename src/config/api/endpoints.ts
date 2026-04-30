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
    studios: createApiEndpoint('studios/', 'GET'),
  },
  map: {
    points: createApiEndpoint('map/points/', 'GET'),
  },
  calendar: createApiEndpoint('calendar/', 'GET'),
  flag: createApiEndpoint('user/flag', 'POST'),
  restart: createApiEndpoint('user/restart', 'POST'),
  getUser: createApiEndpoint('user/', 'GET'),

  courses: {
    list: createApiEndpoint('courses/', 'GET'),
    create: createApiEndpoint('courses/', 'POST'),
    detail: (id: number): EndpointType => createApiEndpoint(`courses/${id}/`, 'GET'),
    update: (id: number): EndpointType => createApiEndpoint(`courses/${id}/`, 'PATCH'),
    delete: (id: number): EndpointType => createApiEndpoint(`courses/${id}/`, 'DELETE'),
    students: (id: number): EndpointType => createApiEndpoint(`courses/${id}/students/`, 'GET'),
    lessons: (id: number): EndpointType => createApiEndpoint(`courses/${id}/lessons/`, 'GET'),
    attendance: (id: number): EndpointType => createApiEndpoint(`courses/${id}/attendance/`, 'GET'),
    attendanceStats: (id: number): EndpointType =>
      createApiEndpoint(`courses/${id}/attendance-stats/`, 'GET'),
    enroll: (id: number, method: EndpointType['method'] = 'POST'): EndpointType =>
      createApiEndpoint(`courses/${id}/enroll/`, method),
  },
  lessons: {
    cancel: (id: number): EndpointType => createApiEndpoint(`lessons/${id}/cancel/`, 'POST'),
    markAttendance: (id: number): EndpointType =>
      createApiEndpoint(`lessons/${id}/attendance/mark/`, 'POST'),
    update: (id: number): EndpointType => createApiEndpoint(`lessons/${id}/`, 'PATCH'),
  },

  /** Записи студента: полные карточки курсов — только для раздела «Мои записи». */
  enrollments: {
    list: createApiEndpoint('enrollments/', 'GET'),
  },

  /** Записи с полями enrollment (статус записи) — для страницы курса и т.п. без GET /enrollments/ */
  myCourses: createApiEndpoint('my-courses/', 'GET'),
  teachers: {
    list: createApiEndpoint('teachers/', 'GET'),
    create: createApiEndpoint('teachers/', 'POST'),
    detail: (id: number): EndpointType => createApiEndpoint(`teachers/${id}/`, 'GET'),
    update: (id: number): EndpointType => createApiEndpoint(`teachers/${id}/`, 'PUT'),
    favorite: (id: number, method: EndpointType['method'] = 'POST'): EndpointType =>
      createApiEndpoint(`favorite-teachers/${id}/`, method),
    myCourses: createApiEndpoint('my-teaching-courses/', 'GET'),
  },
} as const;
