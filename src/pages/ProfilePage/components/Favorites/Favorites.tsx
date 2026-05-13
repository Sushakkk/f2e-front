import { observer } from 'mobx-react';
import * as React from 'react';

import { SectionHeader, Card } from 'components/common';
import { COURSES_CONFIG } from 'config/cards';
import { useRootStore } from 'store/globals/root';

import ProfileCard from '../ProfileCard';

import s from './Favorites.module.scss';

type Props = {
  favoriteCourseIds: number[];
  favoriteTeacherIds: number[];
  favoriteTeacherNames: string[];
  favoriteTeacherAvatars: string[];
  onTeacherClick: (id: number) => void;
};

const Favorites: React.FC<Props> = ({
  favoriteCourseIds,
  favoriteTeacherIds,
  favoriteTeacherNames,
  favoriteTeacherAvatars,
  onTeacherClick,
}) => {
  const rootStore = useRootStore();

  const favoriteCourses = React.useMemo(
    () =>
      favoriteCourseIds
        .map(
          (id) =>
            rootStore.coursesStore.courses.find((c) => c.id === id) ??
            COURSES_CONFIG.find((c) => c.id === id)
        )
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [favoriteCourseIds, rootStore.coursesStore.courses]
  );

  const teacherRows = React.useMemo(() => {
    const ids = favoriteTeacherIds;
    const names = favoriteTeacherNames;
    const avatars = favoriteTeacherAvatars;
    const length = Math.max(ids.length, names.length, avatars.length);
    const rows: { id: number | undefined; name: string; avatar?: string }[] = [];

    for (let index = 0; index < length; index += 1) {
      const rawName = names[index];
      const rawAvatar = avatars[index];

      rows.push({
        id: ids[index],
        name: rawName?.trim() ? rawName : 'Преподаватель',
        avatar: rawAvatar?.trim() ? rawAvatar : undefined,
      });
    }

    return rows.filter((row) => typeof row.id === 'number' || row.name !== 'Преподаватель');
  }, [favoriteTeacherAvatars, favoriteTeacherIds, favoriteTeacherNames]);

  const hasFavoriteTeachers = teacherRows.length > 0;

  if (favoriteCourses.length === 0 && !hasFavoriteTeachers) {
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
      {hasFavoriteTeachers && (
        <div className={s.section}>
          <SectionHeader title="Избранные преподаватели" />
          <div className={s.list}>
            {teacherRows.map((row, index) => {
              const teacherId = row.id;

              return (
                <ProfileCard
                  key={`${row.id ?? 't'}-${row.name}-${index}`}
                  title={row.name}
                  avatar={row.avatar}
                  onClick={
                    typeof teacherId === 'number' ? () => onTeacherClick(teacherId) : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(Favorites);
