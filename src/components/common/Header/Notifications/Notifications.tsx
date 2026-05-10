import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { RoutePath } from 'config/router/paths';
import type { NotificationClient } from 'entities/notification';
import { useNotificationsStore, useUserStore } from 'store/hooks';

import s from './Notifications.module.scss';
import BellIcon from './img/bell.svg?react';

function formatRelativeNotificationTime(iso: string): string {
  const ts = new Date(iso).getTime();

  if (Number.isNaN(ts)) {
    return '';
  }

  const diffMin = Math.floor((Date.now() - ts) / 60000);

  if (diffMin < 1) {
    return 'только что';
  }

  if (diffMin < 60) {
    return `${diffMin} мин назад`;
  }

  const diffH = Math.floor(diffMin / 60);

  if (diffH < 24) {
    return `${diffH} ч назад`;
  }

  const diffD = Math.floor(diffH / 24);

  if (diffD < 7) {
    return `${diffD} дн. назад`;
  }

  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

const Notifications: React.FC = () => {
  const userStore = useUserStore();
  const notificationsStore = useNotificationsStore();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open || !userStore.user) {
      return;
    }

    void notificationsStore.load();
  }, [open, notificationsStore, userStore.user]);

  const handleItemClick = React.useCallback(
    (item: NotificationClient) => {
      if (!item.readAt) {
        void notificationsStore.markRead(item.id);
      }

      if (item.courseId !== null) {
        navigate(generatePath(RoutePath.course, { id: String(item.courseId) }));
        setOpen(false);
      }
    },
    [navigate, notificationsStore]
  );

  const handleMarkRead = React.useCallback(
    (event: React.MouseEvent, item: NotificationClient) => {
      event.stopPropagation();
      void notificationsStore.markRead(item.id);
    },
    [notificationsStore]
  );

  const handleDelete = React.useCallback(
    (event: React.MouseEvent, item: NotificationClient) => {
      event.stopPropagation();
      void notificationsStore.deleteNotification(item.id);
    },
    [notificationsStore]
  );

  const handleMarkAllRead = React.useCallback(() => {
    void notificationsStore.markAllRead();
  }, [notificationsStore]);

  if (!userStore.user) {
    return null;
  }

  const unread = notificationsStore.unreadCount;

  return (
    <div className={s.root}>
      <BellIcon
        type="button"
        className={s.bellBtn}
        aria-label="Уведомления"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        aria-hidden
      />
      {unread > 0 && <span className={s.badge}>{unread > 99 ? '99+' : unread}</span>}
      {open && (
        <div className={s.popover} role="dialog" aria-label="Уведомления">
          <div className={s.popoverHead}>
            <div className={s.popoverTitle}>Уведомления</div>
            <div className={s.popoverActions}>
              {unread > 0 && (
                <button
                  type="button"
                  className={s.popoverAction}
                  onClick={handleMarkAllRead}
                >
                  Прочитать всё
                </button>
              )}
              <button
                type="button"
                className={s.popoverClose}
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>
          {notificationsStore.items.length === 0 ? (
            <div className={s.empty}>Пока нет уведомлений</div>
          ) : (
            <div className={s.list}>
              {notificationsStore.items.map((item) => {
                const unreadItem = !item.readAt;
                const isNavigable = item.courseId !== null;

                return (
                  <div
                    key={item.id}
                    className={cn(s.item, unreadItem && s.itemUnread)}
                    role={isNavigable ? 'button' : undefined}
                    tabIndex={isNavigable ? 0 : -1}
                    onClick={() => {
                      if (isNavigable) {
                        handleItemClick(item);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (!isNavigable) {
                        return;
                      }

                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleItemClick(item);
                      }
                    }}
                  >
                    <span className={s.itemDot} aria-hidden />
                    <span className={s.itemMain}>
                      <span className={s.itemTop}>
                        <span className={s.itemTitle}>{item.title}</span>
                        <span className={s.itemTime}>
                          {formatRelativeNotificationTime(item.createdAt)}
                        </span>
                      </span>
                      <span className={s.itemText}>{item.body}</span>
                      <span className={s.itemActions}>
                        {unreadItem && (
                          <button
                            type="button"
                            className={s.itemAction}
                            onClick={(event) => handleMarkRead(event, item)}
                          >
                            Прочитано
                          </button>
                        )}
                        <button
                          type="button"
                          className={s.itemActionDanger}
                          onClick={(event) => handleDelete(event, item)}
                        >
                          Удалить
                        </button>
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default observer(Notifications);
