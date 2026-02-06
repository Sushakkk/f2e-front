import React from 'react';
import cn from 'classnames';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import s from './Recommendations.module.scss';
import { CourseConfigItem } from 'pages/HomePage/config/cards';

type Props = {
  items: CourseConfigItem[];
  className?: string;
};

export const Recommendations: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={cn(s.root, className)}>
      <Swiper
        className={s.swiper}
        modules={[EffectCoverflow, Navigation, Autoplay]}
        effect="coverflow"
        centeredSlides
        loop
        grabCursor
        navigation
        slidesPerView={1}
        breakpoints={{
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
        {items.map((it) => (
          <SwiperSlide key={it.id}>
            <div className={s.card}>
              <img
                className={s.img}
                src={it.image}
                alt={it.title}
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Recommendations;
