import cn from 'classnames';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowIcon from 'assets/images/arrow.svg?react';
import HeartFilledIcon from 'assets/images/heart-filled.svg?react';
import HeartIcon from 'assets/images/heart.svg?react';
import { CoverflowSwiper } from 'components/common/CoverflowSwiper';

import s from './InfoPage.module.scss';

type Props = React.PropsWithChildren<{
  title: string;
  description: string;
  images?: string[];
  button?: React.ReactNode;
}>;

const InfoPage: React.FC<Props> = ({ title, description, images, button, children }) => {
  const navigate = useNavigate();

  const [liked, setLiked] = React.useState(false);

  React.useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleGoBack = React.useCallback(() => navigate(-1), [navigate]);
  const handleLike = React.useCallback(() => setLiked(true), []);
  const handleUnlike = React.useCallback(() => setLiked(false), []);

  const normalizedImages = React.useMemo(() => {
    if (!images || images.length === 0) {
      return [];
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
          {liked ? (
            <HeartFilledIcon
              className={cn(s.button, s.liked)}
              onClick={handleUnlike}
              aria-label="Убрать из избранного"
            />
          ) : (
            <HeartIcon className={s.button} onClick={handleLike} aria-label="В избранное" />
          )}
        </div>
        {images && images.length > 0 && (
          <CoverflowSwiper
            items={normalizedImages}
            getImage={(src: string) => src}
            getAlt={() => title}
          />
        )}
      </div>
      <div className={s.details}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.text}>{description}</p>
        <div className={s.content}>{children}</div>
      </div>
      {button}
    </div>
  );
};

export default React.memo(InfoPage);
