import type { CourseLevel } from 'pages/HomePage/config/levels';

export type DraftState = {
  titles: string[];
  levels: CourseLevel[];
  teachers: string[];
  studios: string[];
  weekdays: string[];
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  priceFrom: string;
  priceTo: string;
};

export type CoursesFiltersValue = {
  titles: string[];
  levels: CourseLevel[];
  teachers?: string[];
  studios?: string[];
  weekdays?: string[];
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  priceFrom?: number;
  priceTo?: number;
};
