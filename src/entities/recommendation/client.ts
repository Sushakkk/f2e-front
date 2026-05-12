import type { CourseConfigItem } from 'config/cards';

export type RecommendationClient = {
  score: number;
  reasons: string[];
  factors: Record<string, number>;
  course: CourseConfigItem;
};
