import cx from 'clsx';
import * as React from 'react';

import Button, { type ButtonMode } from '../Button/Button';

import s from './Modal.module.scss';

const DEFAULT_MESSAGE = 'Вы точно уверены?';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onConfirm: VoidFunction;
  message?: string;
  className?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  hideActions?: boolean;
  confirmMode?: ButtonMode;
  cancelMode?: ButtonMode;
};

const Modal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  message = DEFAULT_MESSAGE,
  className,
  children,
  confirmText = 'Да',
  cancelText = 'Нет',
  hideActions = false,
  confirmMode = 'dark',
  cancelMode = 'purpleDashed',
}) => {
  const titleId = React.useId();

  if (!open) {
    return null;
  }

  return (
    <div className={cx(s.root, children && s.root_form, className)} role="presentation">
      <button type="button" className={s.root__backdrop} aria-label="Закрыть" onClick={onClose} />
      <div className={s.root__sheet} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {message && (
          <p id={titleId} className={s.root__message}>
            {message}
          </p>
        )}
        {children}
        {!hideActions && (
          <div className={s.root__actions}>
            <Button type="button" mode={cancelMode} className={s.root__btn} onClick={onClose}>
              {cancelText}
            </Button>
            <Button type="button" mode={confirmMode} className={s.root__btn} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Modal);
