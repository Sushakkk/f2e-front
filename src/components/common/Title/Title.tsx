import cn from 'classnames';
import * as React from 'react';

import s from './Title.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'span';
};

const Title: React.FC<Props> = ({ children, className, as: Component = 'h1' }) => (
  <Component className={cn(s.title, className)}>{children}</Component>
);

export default React.memo(Title);
