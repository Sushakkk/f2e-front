export type CourseAttendanceServer = {
  id: number;
  lesson_id: number;
  lesson_date: string;
  course_id: number;
  course_name: string;
  student_id: number;
  student_name: string;
  status: string;
  marked_at: string;
};

export type CourseAttendanceResponseServer = CourseAttendanceServer[];

export type MarkAttendancePayloadServer = {
  student_id: number;
  status: 'present' | 'absent';
};
