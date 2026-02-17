import cn from 'classnames';
import * as React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import Button from 'components/common/Button/Button';
import { InfoPage } from 'components/common/InfoPage';
import { Row } from 'components/common/Row';
import { COURSES_CONFIG, CourseConfigItem } from 'pages/HomePage/config/cards';
import { formatCourseLevel } from 'pages/HomePage/config/levels';
import { getScheduleLines } from 'utils/scheduleUtils';

import s from './CoursePage.module.scss';

const CoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const course: CourseConfigItem | undefined = React.useMemo(
    () => COURSES_CONFIG.find((c) => c.id === Number(id)),
    [id]
  );

  const scheduleLines = React.useMemo(() => (course ? getScheduleLines(course) : []), [course]);

  if (!id || !course) {
    return <Navigate to="/" />;
  }

  return (
    <InfoPage
      title={course.name}
      description={course.description}
      image={course.images[0]}
      button={
        <Button mode="purple" className={s.enrollBtn}>
          Записаться
        </Button>
      }
    >
      <Row label="Преподаватель:" accent>
        <Link
          to={`/teacher/${encodeURIComponent(course.teacher.name)}`}
          className={cn(s.text, s.text_accent)}
        >
          {course.teacher.name}
        </Link>
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
    </InfoPage>
  );
};

export default CoursePage;
