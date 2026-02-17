import cn from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import { CourseConfigItem } from 'pages/HomePage/config/cards';
import { formatCourseLevel } from 'pages/HomePage/config/levels';
import { getScheduleDisplay } from 'utils/scheduleUtils';

import s from './Recommendations.module.scss';

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
          [1024]: {
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
        {items.map((it) => {
          const schedule = getScheduleDisplay(it);

          return (
            <SwiperSlide key={it.id}>
              <Link to={`/course/${it.id}`} className={s.card}>
                <img
                  className={s.img}
                  src={it.images[0]}
                  alt={it.name}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
                <div className={s.level}>{formatCourseLevel(it.level)}</div>
                <div className={s.overlay}>
                  <div className={s.title}>{it.name}</div>
                  {it.teacher && <div className={s.subtitle}>{it.teacher.name}</div>}
                  {it.dateFrom && it.dateTo && (
                    <div className={s.subtitle}>
                      {it.dateFrom} - {it.dateTo}
                    </div>
                  )}
                  <div className={s.bottom}>
                    {schedule && (
                      <div className={s.subtitle}>
                        {schedule.days}
                        {schedule.time && (
                          <>
                            {' '}
                            <span className={s.time}>{schedule.time}</span>
                          </>
                        )}
                      </div>
                    )}
                    {it.price && <div className={s.price}>{it.price.toLocaleString()} ₽</div>}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Recommendations;
