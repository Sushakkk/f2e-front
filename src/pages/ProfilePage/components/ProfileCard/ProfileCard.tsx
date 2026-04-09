import * as React from 'react';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';

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
      <img className={s.avatar} src={avatar || fallbackImage} alt="" />
      <div className={s.content}>
        <span className={s.title}>{title}</span>
        {meta !== null && <span className={s.meta}>{meta}</span>}
      </div>
    </div>
  );
};

export default ProfileCard;
