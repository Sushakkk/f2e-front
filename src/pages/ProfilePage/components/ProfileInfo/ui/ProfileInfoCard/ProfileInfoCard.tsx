import cn from 'classnames';
import * as React from 'react';

import { Title } from 'components/common';

import s from './ProfileInfoCard.module.scss';

type Props = {
  title?: string;
  hint?: string;
  headerRight?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  hintClassName?: string;
  children: React.ReactNode;
};

export const ProfileInfoCard: React.FC<Props> = ({
  title,
  hint,
  headerRight,
  className,
  contentClassName,
  titleClassName,
  hintClassName,
  children,
}) => (
  <section className={cn(s.card, className)}>
    {(title ?? hint ?? headerRight) && (
      <div className={s.cardHeader}>
        <div>
          {title && (
            <Title as="h2" className={cn(s.sectionTitle, titleClassName)}>
              {title}
            </Title>
          )}
          {hint && <div className={cn(s.sectionHint, hintClassName)}>{hint}</div>}
        </div>
        {headerRight}
      </div>
    )}
    <div className={cn(s.cardContent, contentClassName)}>{children}</div>
  </section>
);

export default React.memo(ProfileInfoCard);
