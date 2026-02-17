import cn from 'classnames';
import * as React from 'react';

import s from './Row.module.scss';

type Props = {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
};

const Row: React.FC<Props> = ({ label, children, accent }) => (
  <div className={s.row}>
    <span className={s.label}>{label}</span>
    <span className={accent ? cn(s.text, s.text_accent) : s.text}>{children}</span>
  </div>
);

export default React.memo(Row);
