import * as React from 'react';

import s from './ZoomControls.module.scss';

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
};

const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut }) => (
  <div className={s.root}>
    <button className={s.btn} onClick={onZoomIn} aria-label="Приблизить">
      +
    </button>
    <button className={s.btn} onClick={onZoomOut} aria-label="Отдалить">
      −
    </button>
  </div>
);

export default React.memo(ZoomControls);
