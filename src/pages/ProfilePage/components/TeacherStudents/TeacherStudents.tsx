import { observer } from 'mobx-react';
import * as React from 'react';

import { SelectDropdown } from 'components/common';
import type { ProfilePageStore } from 'store/ProfilePageStore';

import ProfileCard from '../ProfileCard';

import s from './TeacherStudents.module.scss';

type Props = {
  store: ProfilePageStore;
};

const TeacherStudents: React.FC<Props> = ({ store }) => {
  const [selectedLessonId, setSelectedLessonId] = React.useState<number | null>(null);

  const courseOptions = React.useMemo(
    () =>
      store.activeCourses.map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [store.activeCourses]
  );

  const lessonOptions = React.useMemo(
    () =>
      store.lessons
        .filter((l) => l.status === 'scheduled')
        .map((l) => ({
          value: String(l.id),
          label: `${l.date} (${l.timeFrom}–${l.timeTo})`,
        })),
    [store.lessons]
  );

  React.useEffect(() => {
    if (!store.selectedCourseId && store.activeCourses.length > 0) {
      store.setSelectedCourse(store.activeCourses[0].id);
    }
  }, [store, store.activeCourses.length, store.selectedCourseId]);

  const handleCourseChange = React.useCallback(
    (value: string) => {
      store.setSelectedCourse(Number(value));
      setSelectedLessonId(null);
    },
    [store]
  );

  const scheduledLessons = React.useMemo(
    () => store.lessons.filter((l) => l.status === 'scheduled'),
    [store.lessons]
  );

  const attendanceMap = React.useMemo(() => {
    const map = new Map<string, boolean>();

    for (const rec of store.attendanceData) {
      map.set(`${rec.lessonId}_${rec.studentId}`, rec.present);
    }

    return map;
  }, [store.attendanceData]);

  const handleToggle = React.useCallback(
    (lessonId: number, studentId: number, current: boolean) => {
      void store.markAttendance(lessonId, studentId, !current);
    },
    [store]
  );

  return (
    <div className={s.root}>
      <div className={s.selector}>
        <label className={s.label}>Курс</label>
        <SelectDropdown
          mode="single"
          value={store.selectedCourseId ? String(store.selectedCourseId) : ''}
          placeholder="Выберите курс"
          options={courseOptions}
          onChange={handleCourseChange}
        />
      </div>
      {store.selectedCourseId && store.students.length === 0 && (
        <div className={s.empty}>Нет записавшихся учеников</div>
      )}
      {store.students.length > 0 && (
        <div className={s.studentsSection}>
          <h3 className={s.subTitle}>Записавшиеся ученики ({store.students.length})</h3>
          <div className={s.studentsList}>
            {store.students.map((student) => (
              <ProfileCard
                key={student.id}
                title={`${student.firstName} ${student.lastName}`}
                meta={student.email}
                avatar={student.avatar}
              />
            ))}
          </div>
        </div>
      )}
      {store.students.length > 0 && scheduledLessons.length > 0 && (
        <div className={s.attendanceSection}>
          <h3 className={s.subTitle}>Отметка посещаемости</h3>
          <div className={s.selector}>
            <label className={s.label}>Занятие</label>
            <SelectDropdown
              mode="single"
              value={selectedLessonId ? String(selectedLessonId) : ''}
              placeholder="Выберите занятие"
              options={lessonOptions}
              onChange={(value) => setSelectedLessonId(Number(value))}
            />
          </div>
          {selectedLessonId && (
            <div className={s.attendanceList}>
              {store.students.map((student) => {
                const key = `${selectedLessonId}_${student.id}`;
                const present = attendanceMap.get(key) ?? false;

                return (
                  <div key={student.id} className={s.attendanceRow}>
                    <label className={s.checkLabel}>
                      <input
                        type="checkbox"
                        className={s.checkbox}
                        checked={present}
                        onChange={() => handleToggle(selectedLessonId, student.id, present)}
                      />
                      <span className={s.studentName}>
                        {student.firstName} {student.lastName}
                      </span>
                    </label>
                    <span className={present ? s.statusPresent : s.statusAbsent}>
                      {present ? 'Присутствует' : 'Отсутствует'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default observer(TeacherStudents);
