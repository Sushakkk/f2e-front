import type { CourseLevel } from 'pages/HomePage/config/levels';

export type DraftState = {
  types: string[];
  levels: CourseLevel[];
  teachers: string[];
  studios: string[];
  cities: string[];
  weekdays: string[];
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  priceFrom: string;
  priceTo: string;
};

export type CoursesFiltersValue = {
  types: string[];
  levels: CourseLevel[];
  teachers?: string[];
  studios?: string[];
  cities?: string[];
  weekdays?: string[];
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  priceFrom?: number;
  priceTo?: number;
};
