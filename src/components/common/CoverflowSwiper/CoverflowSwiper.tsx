import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import ScreenSpinner from 'components/common/ScreenSpinner/ScreenSpinner';
import { useMediaQuery } from 'utils/useMediaQuery';

import s from './CoverflowSwiper.module.scss';

const TABLET_QUERY = '(max-width: 992px)';

type Props<T> = {
  items: T[];
  className?: string;
  getImage: (item: T) => string;
  getKey?: (item: T, index: number) => string | number;
  getAlt?: (item: T) => string;
  onItemClick?: (item: T) => void;
  children?: (item: T) => React.ReactNode;
};

const MIN_LOADER_MS = 300;

function useImageOrientations<T>(items: T[], getImage: (item: T) => string) {
  const [verticalSet, setVerticalSet] = useState<Set<number> | null>(null);
  const getImageRef = useRef(getImage);
  getImageRef.current = getImage;

  useEffect(() => {
    if (items.length === 0) {
      setVerticalSet(new Set());

      return;
    }

    let cancelled = false;
    const verticals = new Set<number>();
    let pending = 0;
    let imagesReady = false;
    let timerReady = false;

    const tryFinish = () => {
      if (!cancelled && imagesReady && timerReady) {
        setVerticalSet(new Set(verticals));
      }
    };

    const timer = setTimeout(() => {
      timerReady = true;
      tryFinish();
    }, MIN_LOADER_MS);

    const onAllImagesProcessed = () => {
      imagesReady = true;
      tryFinish();
    };

    items.forEach((item, index) => {
      const img = new Image();
      img.src = getImageRef.current(item);

      if (img.complete && img.naturalWidth > 0) {
        if (img.naturalHeight > img.naturalWidth) {
          verticals.add(index);
        }

        return;
      }

      pending++;

      const onDone = () => {
        if (cancelled) {
          return;
        }

        if (img.naturalHeight > img.naturalWidth) {
          verticals.add(index);
        }

        pending--;

        if (pending === 0) {
          onAllImagesProcessed();
        }
      };

      img.onload = onDone;
      img.onerror = onDone;
    });

    if (pending === 0) {
      onAllImagesProcessed();
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [items]);

  return verticalSet;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function CoverflowSwiper<T>({
  items,
  className,
  getImage,
  getKey,
  getAlt,
  onItemClick,
  children,
}: Props<T>) {
  const verticalSet = useImageOrientations(items, getImage);
  const isTablet = useMediaQuery(TABLET_QUERY);

  if (!verticalSet) {
    return (
      <div className={cn(s.root, className)}>
        <div className={s.loader} />
        <ScreenSpinner />
      </div>
    );
  }

  return (
    <div className={cn(s.root, className)}>
      <Swiper
        key={isTablet ? 'slide' : 'coverflow'}
        className={s.swiper}
        modules={[EffectCoverflow, Navigation, Autoplay]}
        effect={isTablet ? 'slide' : 'coverflow'}
        centeredSlides
        loop={items.length > 1}
        grabCursor
        navigation={!isTablet}
        slidesPerView={1}
        spaceBetween={isTablet ? 16 : 0}
        breakpoints={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          1024: {
            slidesPerView: 2,
          },
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={900}
        coverflowEffect={
          isTablet
            ? undefined
            : {
                rotate: 0,
                stretch: 0,
                depth: 320,
                modifier: 1,
                slideShadows: false,
              }
        }
      >
        {items.map((it, index) => (
          <SwiperSlide key={getKey ? getKey(it, index) : index}>
            <div
              className={cn(s.card, verticalSet.has(index) && s.card_vertical)}
              onClick={onItemClick ? () => onItemClick(it) : undefined}
            >
              <img
                className={s.img}
                src={getImage(it)}
                alt={getAlt ? getAlt(it) : ''}
                draggable={false}
                decoding="async"
              />
              {children?.(it)}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default CoverflowSwiper;
