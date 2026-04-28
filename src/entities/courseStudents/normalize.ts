import type { CourseStudentClient } from './client';
import type { CourseStudentServer } from './server';

const LEVEL_MAP: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний уровень',
  advanced: 'Продвинутый',
  any: 'Любой уровень',
};

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    lastName: parts[0],
    firstName: parts.slice(1).join(' '),
  };
}

export function normalizeCourseStudent(data: CourseStudentServer): CourseStudentClient {
  const fullName = data.full_name || data.email;
  const { firstName, lastName } = splitFullName(fullName);

  return {
    id: data.user_id,
    enrollmentId: data.enrollment_id,
    fullName,
    firstName,
    lastName,
    email: data.email,
    phone: data.phone,
    level: LEVEL_MAP[data.dance_level] ?? data.dance_level,
    enrolledAt: data.enrolled_at,
    status: data.status,
    paid: data.paid,
  };
}
