import type { CourseListItemServer } from 'entities/courses/server';

export type RecommendationServer = {
  score: number;
  reasons: string[];
  factors: Record<string, number>;
  course: CourseListItemServer;
};
