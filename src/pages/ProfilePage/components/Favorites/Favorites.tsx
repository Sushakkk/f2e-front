import { observer } from 'mobx-react';
import * as React from 'react';

import { SectionHeader, Card } from 'components/common';
import type { CourseConfigItem } from 'config/cards';
import { ENDPOINTS } from 'config/api';
import type { BackendTeacher } from 'entities/teacher';
import type { ErrorResponse } from 'store/globals/api/types';
import { useRootStore } from 'store/globals/root';

import ProfileCard from '../ProfileCard';

import s from './Favorites.module.scss';

type Props = {
  favoriteCourseIds: number[];
  favoriteTeacherIds: number[];
  favoriteTeacherNames: string[];
  courses: CourseConfigItem[];
  onTeacherClick: (id: number) => void;
};

const Favorites: React.FC<Props> = ({
  favoriteCourseIds,
  favoriteTeacherIds,
  favoriteTeacherNames,
  courses,
  onTeacherClick,
}) => {
  const rootStore = useRootStore();
  const [teacherMetaById, setTeacherMetaById] = React.useState<
    Record<number, { avatar?: string; city?: string }>
  >({});

  const favoriteCourses = React.useMemo(
    () =>
      favoriteCourseIds
        .map((id) => courses.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [courses, favoriteCourseIds]
  );

  const teacherRows = React.useMemo(() => {
    const ids = favoriteTeacherIds;
    const names = favoriteTeacherNames;
    const length = Math.max(ids.length, names.length);
    const rows: { id: number | undefined; name: string }[] = [];

    for (let index = 0; index < length; index += 1) {
      const rawName = names[index];

      rows.push({
        id: ids[index],
        name: rawName?.trim() ? rawName : 'Преподаватель',
      });
    }

    return rows.filter((row) => typeof row.id === 'number' || row.name !== 'Преподаватель');
  }, [favoriteTeacherIds, favoriteTeacherNames]);

  React.useEffect(() => {
    const teacherIds = favoriteTeacherIds.filter((id): id is number => typeof id === 'number');

    if (teacherIds.length === 0) {
      setTeacherMetaById({});
      return;
    }

    let cancelled = false;

    const loadTeachers = async (): Promise<void> => {
      const responses = await Promise.all(
        teacherIds.map((teacherId) =>
          rootStore.apiStore
            .createExtendedRequest<BackendTeacher, ErrorResponse>({
              ...ENDPOINTS.teachers.detail(teacherId),
              showExpectedError: false,
              showUnexpectedError: false,
            })
            .call()
        )
      );

      if (cancelled) {
        return;
      }

      const nextMeta = responses.reduce<Record<number, { avatar?: string; city?: string }>>(
        (acc, response, index) => {
          if (!response.isError) {
            acc[teacherIds[index]] = {
              avatar: response.data.avatar || response.data.images?.[0] || undefined,
              city: response.data.city || undefined,
            };
          }

          return acc;
        },
        {}
      );

      setTeacherMetaById(nextMeta);
    };

    void loadTeachers();

    return () => {
      cancelled = true;
    };
  }, [favoriteTeacherIds, rootStore.apiStore]);

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
              const teacherMeta =
                typeof teacherId === 'number' ? teacherMetaById[teacherId] : undefined;

              return (
                <ProfileCard
                  key={`${row.id ?? 't'}-${row.name}-${index}`}
                  title={row.name}
                  meta={teacherMeta?.city ?? 'Преподаватель'}
                  avatar={teacherMeta?.avatar}
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
