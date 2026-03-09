import * as React from 'react';

import s from './SectionHeader.module.scss';

type Props = {
  title: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
};

const SectionHeader: React.FC<Props> = ({ title, onAdd, addLabel = 'Добавить' }) => {
  return (
    <div className={s.root}>
      <h3 className={s.title}>{title}</h3>
      {onAdd && (
        <button type="button" className={s.addBtn} onClick={onAdd} aria-label={addLabel}>
          {addLabel} +
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
