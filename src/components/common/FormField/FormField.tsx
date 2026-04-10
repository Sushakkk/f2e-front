import cx from 'clsx';
import * as React from 'react';

import s from './FormField.module.scss';

type Props = {
  label: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  requiredMarkClassName?: string;
};

export const FormField: React.FC<Props> = ({
  label,
  children,
  error,
  required,
  className,
  labelClassName,
  errorClassName,
  requiredMarkClassName,
}) => {
  return (
    <label className={cx(s.field, className)}>
      <span className={cx(s.label, labelClassName)}>
        {label}
        {required && (
          <span className={cx(s.requiredMark, requiredMarkClassName)} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </span>
      {children}
      {error && <span className={cx(s.error, errorClassName)}>{error}</span>}
    </label>
  );
};

export default React.memo(FormField);
