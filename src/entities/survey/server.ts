export type BackendDanceLevel = 'beginner' | 'intermediate' | 'advanced' | 'any';

export type DictionaryCityServer = {
  id: number;
  name: string;
};

export type DictionaryDanceStyleServer = {
  id: number;
  name: string;
  slug: string;
};

export type SurveyPreferencePayloadServer = {
  city?: string;
  level?: BackendDanceLevel;
  preferred_weekdays?: string[];
  preferred_time_from?: string;
  preferred_time_to?: string;
  price_from?: number;
  price_to?: number;
};

export type SurveySkillPayloadServer = {
  dance_style_id: number;
  level: BackendDanceLevel;
};

export type SurveySubmitPayloadServer = SurveyPreferencePayloadServer & {
  role?: 'student' | 'teacher';
  preferred_dance_styles?: string[];
};
