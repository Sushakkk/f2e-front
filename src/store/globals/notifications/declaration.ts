import type { NotificationClient } from 'entities/notification';
import { IGlobalStore } from 'store/interfaces';

export interface INotificationsStore extends IGlobalStore {
  items: NotificationClient[];

  isLoading: boolean;

  unreadCount: number;

  load: () => Promise<void>;

  markRead: (id: number) => Promise<void>;

  markAllRead: () => Promise<void>;

  deleteNotification: (id: number) => Promise<void>;

  clear: () => void;
}
