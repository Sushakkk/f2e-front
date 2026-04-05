import type { BackendDanceLevel } from './server';

export type SurveyRole = 'student' | 'teacher';

export type DictionaryCity = {
  id: number;
  name: string;
};

export type DictionaryDanceStyle = {
  id: number;
  name: string;
  slug: string;
};

export type SurveyPreferencePayload = {
  city?: string;
  level?: BackendDanceLevel;
  preferred_weekdays?: string[];
  preferred_time_from?: string;
  preferred_time_to?: string;
  price_from?: number;
  price_to?: number;
};

export type SurveySkillPayload = {
  dance_style_id: number;
  level: BackendDanceLevel;
};

export type SurveySubmitPayload = SurveyPreferencePayload & {
  role?: SurveyRole;
  preferred_dance_styles?: string[];
};

export type SurveySyncParams = {
  role: SurveyRole;
  city: string;
  level: string;
  types: string[];
  weekdays: string[];
  timeFrom: string;
  priceFrom?: number;
  priceTo?: number;
};
