import { normalizeCourseListItem } from 'entities/courses';

import type { RecommendationClient } from './client';
import type { RecommendationServer } from './server';

export function normalizeRecommendation(data: RecommendationServer): RecommendationClient {
  return {
    score: Number(data.score ?? 0),
    reasons: data.reasons ?? [],
    factors: data.factors ?? {},
    course: normalizeCourseListItem(data.course),
  };
}
