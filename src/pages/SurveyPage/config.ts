import type { CourseLevel } from 'config/levels';
import { CITIES, LEVELS_ORDER, WEEKDAYS } from 'pages/HomePage/components/Filters/config';

export const SURVEY_DANCE_TYPES = [
  'High Heels',
  'Contemporary',
  'Jazz Funk',
  'Vogue',
  'Hip-Hop',
  'Dancehall',
  'Frame Up',
  'Stretching',
  'Lady Style',
] as const;

export const TIME_PREFERENCES = [
  { value: '09:00', label: 'Утро (до 12:00)' },
  { value: '12:00', label: 'День (12:00–18:00)' },
  { value: '18:00', label: 'Вечер (после 18:00)' },
] as const;

export const BUDGET_OPTIONS = [
  { value: '0-6000', priceFrom: 0, priceTo: 6000, label: 'До 6 000 ₽' },
  { value: '6000-10000', priceFrom: 6000, priceTo: 10000, label: '6 000 – 10 000 ₽' },
  { value: '10000-15000', priceFrom: 10000, priceTo: 15000, label: '10 000 – 15 000 ₽' },
  { value: '15000+', priceFrom: 15000, priceTo: undefined, label: 'Более 15 000 ₽' },
] as const;

export const SURVEY_STEPS = [
  {
    id: 'types',
    title: 'Какие направления вас интересуют?',
    subtitle: 'Выберите один или несколько',
  },
  {
    id: 'level',
    title: 'Ваш уровень подготовки',
    subtitle: 'Поможет подобрать подходящие занятия',
  },
  { id: 'city', title: 'В каком городе хотите заниматься?', subtitle: '' },
  { id: 'weekdays', title: 'Удобные дни недели', subtitle: 'Когда вам удобнее всего?' },
  { id: 'time', title: 'Предпочтительное время', subtitle: 'Утро, день или вечер?' },
  { id: 'budget', title: 'Бюджет на курс', subtitle: 'Необязательно' },
] as const;

export type SurveyStepId = (typeof SURVEY_STEPS)[number]['id'];

export type SurveyAnswers = {
  types: string[];
  level: CourseLevel | '';
  city: string;
  weekdays: string[];
  timeFrom: string;
  priceFrom?: number;
  priceTo?: number;
};

export const DEFAULT_SURVEY_ANSWERS: SurveyAnswers = {
  types: [],
  level: '',
  city: '',
  weekdays: [],
  timeFrom: '',
  priceFrom: undefined,
  priceTo: undefined,
};

export { CITIES, LEVELS_ORDER, WEEKDAYS };
