import cn from 'classnames';
import * as React from 'react';

import s from './Notifications.module.scss';
import BellIcon from './img/bell.svg?react';
import { MOCK_NOTIFICATIONS } from './mockNotifications';

export const Notifications: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={s.root}>
      <BellIcon
        type="button"
        className={s.bellIcon}
        aria-label="Уведомления"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        aria-hidden
      />
      <span className={s.badge}>3</span>
      {open && (
        <div className={s.popover} role="dialog" aria-label="Уведомления">
          <div className={s.popoverHead}>
            <div className={s.popoverTitle}>Уведомления</div>
            <button
              type="button"
              className={s.popoverClose}
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className={s.empty}>Пока нет уведомлений</div>
          ) : (
            <div className={s.list}>
              {MOCK_NOTIFICATIONS.map(({ id, title, text, time, unread }) => (
                <button key={id} type="button" className={cn(s.item, unread && s.itemUnread)}>
                  <span className={s.itemDot} aria-hidden />
                  <span className={s.itemMain}>
                    <span className={s.itemTop}>
                      <span className={s.itemTitle}>{title}</span>
                      <span className={s.itemTime}>{time}</span>
                    </span>
                    <span className={s.itemText}>{text}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Notifications);
