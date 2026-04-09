import { observer } from 'mobx-react';
import * as React from 'react';

import { SectionHeader, Card } from 'components/common';
import { COURSES_CONFIG } from 'config/cards';

import ProfileCard from '../ProfileCard';

import s from './Favorites.module.scss';

type Props = {
  favoriteCourseIds: number[];
  favoriteTeacherIds: number[];
  favoriteTeacherNames: string[];
  onTeacherClick: (id: number) => void;
};

const Favorites: React.FC<Props> = ({
  favoriteCourseIds,
  favoriteTeacherIds,
  favoriteTeacherNames,
  onTeacherClick,
}) => {
  const favoriteCourses = React.useMemo(
    () =>
      favoriteCourseIds
        .map((id) => COURSES_CONFIG.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [favoriteCourseIds]
  );

  const getTeacherAvatar = React.useCallback((name: string) => {
    const course = COURSES_CONFIG.find((c) => c.teacher.name === name);

    return course?.teacher.images?.[0];
  }, []);

  if (favoriteCourses.length === 0 && favoriteTeacherNames.length === 0) {
    return <div className={s.empty}>У вас пока нет избранного</div>;
  }

  return (
    <div className={s.root}>
      {favoriteCourses.length > 0 && (
        <div className={s.section}>
          <SectionHeader title="Избранные курсы" />
          <div className={s.courseList}>
            {favoriteCourses.map((course) => (
              <Card key={course.id} item={course} compact profile className={s.courseCard} />
            ))}
          </div>
        </div>
      )}
      {favoriteTeacherNames.length > 0 && (
        <div className={s.section}>
          <SectionHeader title="Избранные преподаватели" />
          <div className={s.list}>
            {favoriteTeacherNames.map((name, index) => (
              <ProfileCard
                key={`${name}-${favoriteTeacherIds[index] ?? index}`}
                title={name}
                avatar={getTeacherAvatar(name)}
                onClick={
                  favoriteTeacherIds[index]
                    ? () => onTeacherClick(favoriteTeacherIds[index])
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(Favorites);
