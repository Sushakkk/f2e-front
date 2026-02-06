export type DanceLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export type DayOfWeek = 'any' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type Course = {
  id: string;
  title: string;
  teacher: string;
  studio: string;
  danceType: string;
  level: DanceLevel;
  dateFrom: string; // ISO YYYY-MM-DD
  dateTo: string; // ISO YYYY-MM-DD
  priceRub: number;
  coverUrl: string;
  subtitle?: string;
  isRecommended?: boolean;
};

export type FiltersState = {
  danceTypes: string[]; // multi
  level: DanceLevel | 'any'; // single
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  day: DayOfWeek;
  teacherQuery: string;
  studioQuery: string;
  priceFrom?: number;
  priceTo?: number;
};
