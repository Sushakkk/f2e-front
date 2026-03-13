import * as React from 'react';

import s from './ProfileCard.module.scss';

export type ProfileCardProps = {
  title: React.ReactNode;
  meta?: React.ReactNode;
  avatar?: string;
  onClick?: () => void;
  variant?: 'default' | 'accent';
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  meta,
  avatar,
  onClick,
  variant = 'default',
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <div
      className={`${s.card} ${s[variant]} ${isInteractive ? s.interactive : ''}`}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {avatar ? (
        <img className={s.avatar} src={avatar} alt="" />
      ) : (
        <div className={s.avatarPlaceholder} aria-hidden />
      )}
      <div className={s.content}>
        <span className={s.title}>{title}</span>
        {meta !== null && <span className={s.meta}>{meta}</span>}
      </div>
    </div>
  );
};

export default ProfileCard;
