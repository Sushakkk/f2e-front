import cn from 'classnames';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ArrowIcon from 'assets/images/arrow.svg?react';
import HeartFilledIcon from 'assets/images/heart-filled.svg?react';
import HeartIcon from 'assets/images/heart.svg?react';
import Button from 'components/common/Button/Button';
import { COURSES_CONFIG, CourseConfigItem } from 'pages/HomePage/config/cards';
import { formatCourseLevel } from 'pages/HomePage/config/levels';
import { getScheduleLines } from 'utils/scheduleUtils';

import s from './CoursePage.module.scss';
import { Row } from './components';

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [liked, setLiked] = React.useState(false);

  React.useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  const course: CourseConfigItem | undefined = React.useMemo(
    () => COURSES_CONFIG.find((c) => c.id === Number(id)),
    [id]
  );

  const scheduleLines = React.useMemo(() => (course ? getScheduleLines(course) : []), [course]);

  const handleGoBack = React.useCallback(() => navigate(-1), [navigate]);
  const handleLike = React.useCallback(() => setLiked(true), []);
  const handleUnlike = React.useCallback(() => setLiked(false), []);

  if (!course) {
    return null;
  }

  return (
    <div className={s.page}>
      <div className={s.heroSection}>
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
        <div className={s.imageWrapper}>
          <img src={course.image} alt={course.name} />
        </div>
      </div>
      <div className={s.body}>
        <h1 className={s.title}>{course.name}</h1>
        <p className={s.text}>{course.description}</p>
        <div className={s.details}>
          <Row label="Преподаватель:" accent>
            {course.teacher}
          </Row>
          <Row label="Направление:">{course.type}</Row>
          <Row label="Уровень:">{formatCourseLevel(course.level)}</Row>
          {course.city && <Row label="Город:">{course.city}</Row>}
          {course.dateFrom && course.dateTo && (
            <Row label="Дата:">
              {course.dateFrom}-{course.dateTo}
            </Row>
          )}
          {scheduleLines.length > 0 && (
            <Row label="Расписание:">
              {scheduleLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line.day} {line.time}
                  {line.location && ` (${line.location})`}
                  {i < scheduleLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </Row>
          )}
          {course.location && <Row label="Место:">{course.location}</Row>}
          <Row label="Количество мест:">
            {course.capacity} (осталось {course.spotsLeft})
          </Row>
          <Row label="Музыка:">
            <a
              href={course.music.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(s.text, s.text_accent)}
            >
              {course.music.artist} — {course.music.track}
            </a>
          </Row>
          <Row label="Цена:">{course.price.toLocaleString()} ₽</Row>
        </div>
      </div>
      <Button mode="purple" className={s.enrollBtn}>
        Записаться
      </Button>
    </div>
  );
};

export default CoursePage;
