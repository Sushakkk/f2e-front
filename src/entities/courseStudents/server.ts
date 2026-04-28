export type CourseStudentServer = {
  enrollment_id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  dance_level: string;
  enrolled_at: string;
  status: string;
  paid: boolean;
};

export type CourseStudentsResponseServer = CourseStudentServer[];
