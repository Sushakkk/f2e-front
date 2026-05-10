export type NotificationServer = {
  id: number;
  kind: string;
  title: string;
  body: string;
  course_id: number | null;
  lesson_id: number | null;
  read_at: string | null;
  created_at: string;
};
