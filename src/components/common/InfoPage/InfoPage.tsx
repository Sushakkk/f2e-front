import cn from 'classnames';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowIcon from 'assets/images/arrow.svg?react';
import HeartFilledIcon from 'assets/images/heart-filled.svg?react';
import HeartIcon from 'assets/images/heart.svg?react';

import s from './InfoPage.module.scss';

type Props = React.PropsWithChildren<{
  title: string;
  description: string;
  image?: string;
  button?: React.ReactNode;
}>;

const InfoPage: React.FC<Props> = ({ title, description, image, button, children }) => {
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
        {image && (
          <div className={s.imageWrapper}>
            <img src={image} alt={title} />
          </div>
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
