import cn from 'classnames';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowIcon from 'assets/images/arrow.svg?react';
import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
import HeartFilledIcon from 'assets/images/heart-filled.svg?react';
import HeartIcon from 'assets/images/heart.svg?react';
import { CoverflowSwiper } from 'components/common/CoverflowSwiper';

import s from './InfoPage.module.scss';

type Props = React.PropsWithChildren<{
  title: string;
  description: string;
  images?: string[];
  button?: React.ReactNode;
  liked?: boolean;
  onToggleLike?: () => void;
}>;

const InfoPage: React.FC<Props> = ({
  title,
  description,
  images,
  button,
  liked: externalLiked,
  onToggleLike,
  children,
}) => {
  const navigate = useNavigate();

  const [internalLiked, setInternalLiked] = React.useState(false);

  const isLiked = externalLiked ?? internalLiked;

  const handleGoBack = React.useCallback(() => navigate(-1), [navigate]);

  const handleToggleLike = React.useCallback(() => {
    if (onToggleLike) {
      onToggleLike();
    } else {
      setInternalLiked((prev) => !prev);
    }
  }, [onToggleLike]);

  const normalizedImages = React.useMemo(() => {
    if (!images || images.length === 0) {
      return [fallbackImage];
    }

    if (images.length >= 5 || images.length === 1) {
      return images;
    }

    const result: string[] = [];

    while (result.length < 5) {
      result.push(...images);
    }

    return result;
  }, [images]);

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.buttons}>
          <ArrowIcon className={s.button} onClick={handleGoBack} aria-label="Назад" />
          {isLiked ? (
            <HeartFilledIcon
              className={cn(s.button, s.liked)}
              onClick={handleToggleLike}
              aria-label="Убрать из избранного"
            />
          ) : (
            <HeartIcon className={s.button} onClick={handleToggleLike} aria-label="В избранное" />
          )}
        </div>
        <CoverflowSwiper
          items={normalizedImages}
          getImage={(src: string) => src}
          getAlt={() => title}
        />
      </div>
      <div className={s.details}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.text}>{description}</p>
        <div className={s.content}>{children}</div>
      </div>
      {button && <>{button}</>}
    </div>
  );
};

export default React.memo(InfoPage);
