/**
 * Уведомление для UI и стора (camelCase).
 */
export type NotificationClient = {
  id: number;
  kind: string;
  title: string;
  body: string;
  courseId: number | null;
  lessonId: number | null;
  readAt: string | null;
  createdAt: string;
};
