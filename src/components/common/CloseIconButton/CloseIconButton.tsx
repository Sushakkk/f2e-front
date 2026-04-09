import cn from 'classnames';
import * as React from 'react';

import s from './CloseIconButton.module.scss';

type Props = {
  ariaLabel: string;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
};

const CloseIconButton: React.FC<Props> = ({
  ariaLabel,
  className,
  iconClassName,
  onClick,
  type = 'button',
}) => (
  <button type={type} className={cn(s.button, className)} onClick={onClick} aria-label={ariaLabel}>
    <span className={cn(s.icon, iconClassName)} aria-hidden>
      ×
    </span>
  </button>
);

export default CloseIconButton;
