export type NotificationItem = {
  id: string;
  title: string;
  text: string;
  time: string;
  unread?: boolean;
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Тренировка добавлена',
    text: 'Йога • 07:30 • Студия на Литейном',
    time: '2 мин назад',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Напоминание',
    text: 'Через 30 минут начинается занятие “Функциональная тренировка”.',
    time: '1 час назад',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Курс обновлён',
    text: 'Добавлен новый урок в “Питание и восстановление”.',
    time: 'вчера',
  },
];
