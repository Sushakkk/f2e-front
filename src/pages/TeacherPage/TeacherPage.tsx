import * as React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { InfoPage } from 'components/common/InfoPage';
import { Row } from 'components/common/Row';
import { COURSES_CONFIG, CourseConfigItem } from 'config';

import s from './TeacherPage.module.scss';

const TeacherPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();

  const decodedName = name ? decodeURIComponent(name) : '';

  const teacher = React.useMemo(() => {
    const course = COURSES_CONFIG.find((c) => c.teacher.name === decodedName);

    return course?.teacher;
  }, [decodedName]);

  const teacherCourses: CourseConfigItem[] = React.useMemo(
    () => COURSES_CONFIG.filter((c) => c.teacher.name === decodedName),
    [decodedName]
  );

  if (!name || !teacher) {
    return <Navigate to="/" />;
  }

  return (
    <InfoPage title={teacher.name} description={teacher.bio} images={teacher.images}>
      <Row label="Опыт:">{teacher.experience} лет</Row>
      <Row label="Специализации:">{teacher.specializations.join(', ')}</Row>
      {teacher.achievements.length > 0 && (
        <Row label="Достижения:">
          {teacher.achievements.map((a, i) => (
            <React.Fragment key={i}>
              {a}
              {i < teacher.achievements.length - 1 && <br />}
            </React.Fragment>
          ))}
        </Row>
      )}
      {teacherCourses.length > 0 && (
        <Row label="Курсы:">
          {teacherCourses.map((course, i) => (
            <React.Fragment key={course.id}>
              <Link to={`/course/${course.id}`} className={s.courseLink}>
                {course.name}
              </Link>
              {i < teacherCourses.length - 1 && <br />}
            </React.Fragment>
          ))}
        </Row>
      )}
    </InfoPage>
  );
};

export default TeacherPage;
