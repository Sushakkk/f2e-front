/**
 * Client-side курс в формате CourseConfigItem.
 */

import type { ScheduleEntry, Teacher } from 'config/cards';
import type { CourseActivityStatus } from 'config/courseActivity';
import type { CourseLevel } from 'config/levels';
import type { EnrollmentStatus } from 'config/users';

export type CourseListItemClient = {
  id: number;
  name: string;
  type: string;
  teacher: Teacher;
  level: CourseLevel;
  dateFrom: string;
  dateTo: string;
  price: number;
  images: string[];
  studio: string;
  schedule?: ScheduleEntry[];
  city: string;
  description: string;
  capacity: number;
  spotsLeft: number;
  music: { artist: string; track: string; url: string };
  canEnroll?: boolean;
  canCancelEnrollment?: boolean;
  canEdit?: boolean;
  firstLessonAt?: string;
  viewerEnrollmentStatus?: EnrollmentStatus | null;
  activityStatus?: CourseActivityStatus;
};
