import cn from 'classnames';
import React, { useCallback, useState } from 'react';
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import s from './CoverflowSwiper.module.scss';

type Props<T> = {
  items: T[];
  className?: string;
  getImage: (item: T) => string;
  getKey?: (item: T, index: number) => string | number;
  getAlt?: (item: T) => string;
  children?: (item: T) => React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export function CoverflowSwiper<T>({
  items,
  className,
  getImage,
  getKey,
  getAlt,
  children,
}: Props<T>) {
  const [verticalSet, setVerticalSet] = useState<Set<number>>(() => new Set());

  const handleImageLoad = useCallback(
    (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;

      if (img.naturalHeight > img.naturalWidth) {
        setVerticalSet((prev) => {
          if (prev.has(index)) {
            return prev;
          }

          const next = new Set(prev);

          next.add(index);

          return next;
        });
      }
    },
    []
  );

  return (
    <div className={cn(s.root, className)}>
      <Swiper
        className={s.swiper}
        modules={[EffectCoverflow, Navigation, Autoplay]}
        effect="coverflow"
        centeredSlides
        loop={items.length > 1}
        grabCursor
        navigation
        slidesPerView={1}
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
        speed={650}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 320,
          modifier: 1,
          slideShadows: false,
        }}
      >
        {items.map((it, index) => (
          <SwiperSlide key={getKey ? getKey(it, index) : index}>
            <div className={cn(s.card, verticalSet.has(index) && s.card_vertical)}>
              <img
                className={s.img}
                src={getImage(it)}
                alt={getAlt ? getAlt(it) : ''}
                draggable={false}
                loading="lazy"
                decoding="async"
                onLoad={(e) => handleImageLoad(index, e)}
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
