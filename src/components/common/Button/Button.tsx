import cx from 'clsx';
import * as React from 'react';

import s from './Button.module.scss';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<Props> = ({ children, className, ...props }) => {
  return (
    <button {...props} className={cx(s.button, className)}>
      {children}
    </button>
  );
};

export default React.memo(Button);
