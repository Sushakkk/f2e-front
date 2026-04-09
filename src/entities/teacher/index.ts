export type { TeacherClient, TeacherCoursePreview } from './client';

export type {
  BackendTeacher,
  BackendTeacherCourse,
  BackendTeacherListItem,
  BackendTeacherReview,
} from './server';

export { findTeacherIdByName, normalizeTeacher } from './normalize';
