import * as React from 'react';

import type { StudioData } from '../../config';

import s from './StudioCard.module.scss';

type StudioCardProps = {
  studio: StudioData;
  onClose: () => void;
  onClick?: (studio: StudioData) => void;
};

const StudioCard: React.FC<StudioCardProps> = ({ studio, onClose, onClick }) => (
  <>
    <button className={s.backButton} onClick={onClose} aria-label="Закрыть">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
    <div
      className={s.card}
      onClick={onClick ? () => onClick(studio) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={s.imageWrapper}>
        <img src={studio.image} alt={studio.name} className={s.image} />
      </div>
      <div className={s.info}>
        <h3 className={s.name}>{studio.name}</h3>
        <p className={s.address}>
          Адрес: {studio.address}, {studio.metro}
        </p>
        <p className={s.meta}>{studio.courses.join(', ')}</p>
      </div>
    </div>
  </>
);

export default React.memo(StudioCard);
