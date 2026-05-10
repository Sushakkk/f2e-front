import type { NotificationClient } from './client';
import type { NotificationServer } from './server';

export function normalizeNotification(data: NotificationServer): NotificationClient {
  return {
    id: data.id,
    kind: data.kind,
    title: data.title,
    body: data.body,
    courseId: data.course_id,
    lessonId: data.lesson_id,
    readAt: data.read_at,
    createdAt: data.created_at,
  };
}
