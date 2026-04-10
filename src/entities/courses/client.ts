/**
 * Client-side курс в формате CourseConfigItem.
 */

import type { CourseActivityStatus } from 'config/courseActivity';
import type { ScheduleEntry, Teacher } from 'config/cards';
import type { CourseLevel } from 'config/levels';

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
  activityStatus?: CourseActivityStatus;
};
