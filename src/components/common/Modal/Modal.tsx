import cx from 'clsx';
import * as React from 'react';

import { Button } from '../Button';

import s from './Modal.module.scss';

const DEFAULT_MESSAGE = 'Вы точно уверены?';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onConfirm: VoidFunction;
  message?: string;
  className?: string;
};

const Modal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  message = DEFAULT_MESSAGE,
  className,
}) => {
  const titleId = React.useId();

  if (!open) {
    return null;
  }

  return (
    <div className={cx(s.root, className)} role="presentation">
      <button type="button" className={s.root__backdrop} aria-label="Закрыть" onClick={onClose} />
      <div className={s.root__sheet} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <p id={titleId} className={s.root__message}>
          {message}
        </p>
        <div className={s.root__actions}>
          <Button type="button" mode="purpleDashed" className={s.root__btn} onClick={onClose}>
            Нет
          </Button>
          <Button type="button" mode="dark" className={s.root__btn} onClick={onConfirm}>
            Да
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Modal);
