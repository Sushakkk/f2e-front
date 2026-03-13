import type { CourseConfigItem } from './cards';

export type LessonStatus = 'scheduled' | 'cancelled';

export type Lesson = {
  id: number;
  courseId: number;
  date: string;
  timeFrom: string;
  timeTo: string;
  location?: string;
  status: LessonStatus;
};

export type AttendanceRecord = {
  lessonId: number;
  courseId: number;
  studentId: number;
  present: boolean;
  markedAt: string;
};

export type TeacherCourseStatus = 'active' | 'cancelled' | 'completed';

export type TeacherCourse = CourseConfigItem & {
  createdByTeacherId: number;
  courseStatus: TeacherCourseStatus;
};

export type CourseFormData = {
  name: string;
  type: string;
  level: string;
  dateFrom: string;
  dateTo: string;
  price: number;
  studio: string;
  city: string;
  description: string;
  capacity: number;
  schedule: { weekday: string; timeFrom: string; timeTo: string; location?: string }[];
};

export type AttendanceStats = {
  totalLessons: number;
  conductedLessons: number;
  cancelledLessons: number;
  avgAttendancePercent: number;
  totalStudents: number;
  perLesson: {
    lessonId: number;
    date: string;
    present: number;
    absent: number;
    total: number;
    percent: number;
  }[];
  perStudent: {
    studentId: number;
    studentName: string;
    attended: number;
    missed: number;
    total: number;
    percent: number;
  }[];
};
