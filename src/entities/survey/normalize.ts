import type { DictionaryCity, DictionaryDanceStyle } from './client';
import type { DictionaryCityServer, DictionaryDanceStyleServer } from './server';

export function normalizeSurveyCity(data: DictionaryCityServer): DictionaryCity {
  return {
    id: data.id,
    name: data.name,
  };
}

export function normalizeSurveyDanceStyle(data: DictionaryDanceStyleServer): DictionaryDanceStyle {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
  };
}

export function normalizeSurveyCities(data: DictionaryCityServer[]): DictionaryCity[] {
  return data.map(normalizeSurveyCity);
}

export function normalizeSurveyDanceStyles(
  data: DictionaryDanceStyleServer[]
): DictionaryDanceStyle[] {
  return data.map(normalizeSurveyDanceStyle);
}
