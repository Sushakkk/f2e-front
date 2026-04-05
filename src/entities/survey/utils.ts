import type {
  SurveyPreferencePayload,
  SurveySkillPayload,
  SurveySubmitPayload,
  SurveySyncParams,
} from './client';
import { SurveyLevelLabel, SurveyWeekdayLabel } from './enum';
import type { BackendDanceLevel } from './server';

const SURVEY_LEVEL_TO_BACKEND: Record<SurveyLevelLabel, BackendDanceLevel> = {
  [SurveyLevelLabel.beginner]: 'beginner',
  [SurveyLevelLabel.intermediate]: 'intermediate',
  [SurveyLevelLabel.advanced]: 'advanced',
  [SurveyLevelLabel.any]: 'any',
};

const SURVEY_WEEKDAY_TO_BACKEND: Record<SurveyWeekdayLabel, string> = {
  [SurveyWeekdayLabel.mon]: 'mon',
  [SurveyWeekdayLabel.tue]: 'tue',
  [SurveyWeekdayLabel.wed]: 'wed',
  [SurveyWeekdayLabel.thu]: 'thu',
  [SurveyWeekdayLabel.fri]: 'fri',
  [SurveyWeekdayLabel.sat]: 'sat',
  [SurveyWeekdayLabel.sun]: 'sun',
};

export function normalizeSurveyLevel(value: string): BackendDanceLevel | undefined {
  return SURVEY_LEVEL_TO_BACKEND[value as SurveyLevelLabel];
}

export function normalizeSurveyWeekdays(days: string[]): string[] {
  return days
    .map((day) => SURVEY_WEEKDAY_TO_BACKEND[day as SurveyWeekdayLabel])
    .filter((day): day is string => Boolean(day));
}

export function resolveSurveyTimeTo(timeFrom: string): string | undefined {
  switch (timeFrom) {
    case '09:00':
      return '12:00';
    case '12:00':
      return '18:00';
    case '18:00':
      return '23:59';
    default:
      return undefined;
  }
}

export function buildSurveyPreferencePayload({
  city,
  level,
  weekdays,
  timeFrom,
  priceFrom,
  priceTo,
}: Pick<
  SurveySyncParams,
  'city' | 'level' | 'weekdays' | 'timeFrom' | 'priceFrom' | 'priceTo'
>): SurveyPreferencePayload {
  const backendLevel = level ? normalizeSurveyLevel(level) : undefined;

  return {
    city: city || undefined,
    level: backendLevel,
    preferred_weekdays: normalizeSurveyWeekdays(weekdays),
    preferred_time_from: timeFrom || undefined,
    preferred_time_to: resolveSurveyTimeTo(timeFrom),
    price_from: priceFrom,
    price_to: priceTo,
  };
}

export function buildSurveySkillPayload({
  types,
}: Pick<SurveySyncParams, 'types'>): SurveySkillPayload[] {
  if (types.length === 0) {
    return [];
  }

  return [];
}

export function buildSurveySubmitPayload({
  role,
  city,
  level,
  types,
  weekdays,
  timeFrom,
  priceFrom,
  priceTo,
}: SurveySyncParams): SurveySubmitPayload {
  const preferencePayload = buildSurveyPreferencePayload({
    city,
    level,
    weekdays,
    timeFrom,
    priceFrom,
    priceTo,
  });

  return {
    ...preferencePayload,
    role,
    preferred_dance_styles: types,
  };
}
