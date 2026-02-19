import cn from 'classnames';
import * as React from 'react';

import s from './StarRating.module.scss';

type Props = {
  rating: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
};

const TOTAL_STARS = 5;

const StarRating: React.FC<Props> = ({ rating, className, size = 'md', showValue = true }) => {
  const stars = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return Array.from({ length: TOTAL_STARS }, (_, i) => {
      const diff = rating - i;

      if (diff >= 1) {
        return 'full';
      }

      if (diff > 0) {
        return 'half';
      }

      return 'empty';
    });
  }, [rating]);

  return (
    <div className={cn(s.rating, s[`rating_${size}`], className)}>
      <div className={s.stars}>
        {stars.map((type, i) => (
          <svg key={i} className={cn(s.star, s[`star_${type}`])} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={type === 'half' ? `url(#half-${i})` : type === 'full' ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      {showValue && <span className={s.value}>{rating.toFixed(1)}</span>}
    </div>
  );
};

export default React.memo(StarRating);
