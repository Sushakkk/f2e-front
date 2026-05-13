import * as React from 'react';

import Button from 'components/common/Button/Button';
import { StarRating } from 'components/common/StarRating';
import { Review } from 'config';

import s from './ReviewsSection.module.scss';

type Props = {
  reviews: Review[];
};

const ReviewsSection: React.FC<Props> = ({ reviews }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={s.reviewsBlock}>
      <Button mode="dark" className={s.toggleBtn} onClick={() => setOpen((v) => !v)}>
        {open ? 'Скрыть отзывы' : `Отзывы (${reviews.length})`}
      </Button>
      {open && (
        <div className={s.reviewsList}>
          {reviews.map((review, i) => (
            <div key={i} className={s.reviewCard}>
              <div className={s.reviewHeader}>
                <span className={s.reviewAuthor}>{review.author}</span>
                <StarRating rating={review.rating} size="sm" showValue={false} />
              </div>
              {review.courseName && <div className={s.reviewCourse}>Курс: {review.courseName}</div>}
              <span className={s.reviewDate}>{review.date}</span>
              <p className={s.reviewText}>{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ReviewsSection);
