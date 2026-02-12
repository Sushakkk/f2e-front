import cx from 'clsx';
import * as React from 'react';

import s from './Button.module.scss';

export type ButtonMode = 'purple' | 'dark';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  mode?: ButtonMode;
};

const Button: React.FC<Props> = ({ children, className, mode, ...props }) => {
  return (
    <button
      {...props}
      className={cx(
        s.button,
        mode === 'purple' && s.button_purple,
        mode === 'dark' && s.button_dark,
        className
      )}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
