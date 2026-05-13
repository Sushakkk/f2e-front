import type { CourseConfigItem } from './cards';

export type LessonStatus = 'scheduled' | 'cancelled' | 'completed';

export type Lesson = {
  id: number;
  courseId: number;
  date: string;
  timeFrom: string;
  timeTo: string;
  location?: string;
  studio?: string;
  status: LessonStatus;
  canMarkAttendance?: boolean;
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

  /** Начало курса YYYY-MM-DD (для периода статистики по умолчанию) */
  dateRangeFromIso?: string;

  /** Конец курса YYYY-MM-DD */
  dateRangeToIso?: string;
};

export type CourseFormData = {
  name: string;
  type: string;
  level: string;
  dateFrom: string;
  dateTo: string;
  price: string;
  studio: string;
  city: string;
  description: string;
  musicUrl: string;

  /** Строковое значение как у `price`: пусто до ввода, для placeholder в форме */
  capacity: string;
  useSameLocation: boolean;
  sharedLocation: string;
  schedule: {
    weekday: string;
    timeFrom: string;
    timeTo: string;
    location?: string;
    studio?: string;
  }[];
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
