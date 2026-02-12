import * as React from 'react';

import { DATE_PLACEHOLDER } from '../../config';
import type { ActiveField } from '../../types';
import { formatRu } from 'utils/dateUtils';

import s from './RangeTrigger.module.scss';

type Props = {
  from: string;
  to: string;
  open: boolean;
  active: ActiveField;
  fromBtnRef: React.Ref<HTMLButtonElement>;
  toBtnRef: React.Ref<HTMLButtonElement>;
  onToggle: (field: ActiveField) => void;
};

const calendarSvg = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const RangeTrigger: React.FC<Props> = ({
  from,
  to,
  open,
  active,
  fromBtnRef,
  toBtnRef,
  onToggle,
}) => {
  const handleToggleFrom = React.useCallback(() => onToggle('from'), [onToggle]);
  const handleToggleTo = React.useCallback(() => onToggle('to'), [onToggle]);

  return (
    <div className={s.row}>
      <div className={s.inline}>
        <span className={s.label}>с</span>
        <button
          ref={fromBtnRef}
          type="button"
          className={s.btn}
          data-active={open && active === 'from'}
          onClick={handleToggleFrom}
        >
          <span className={s.value}>{formatRu(from) || DATE_PLACEHOLDER}</span>
          <span className={s.icon} aria-hidden="true">
            {calendarSvg}
          </span>
        </button>
      </div>
      <div className={s.inline}>
        <span className={s.label}>по</span>
        <button
          ref={toBtnRef}
          type="button"
          className={s.btn}
          data-active={open && active === 'to'}
          onClick={handleToggleTo}
        >
          <span className={s.value}>{formatRu(to) || DATE_PLACEHOLDER}</span>
          <span className={s.icon} aria-hidden="true">
            {calendarSvg}
          </span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(RangeTrigger);
