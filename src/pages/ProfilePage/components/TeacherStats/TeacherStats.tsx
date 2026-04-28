import cx from 'clsx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { DateRangePicker, SelectDropdown } from 'components/common';
import Button from 'components/common/Button/Button';
import type { ProfilePageStore } from 'store/ProfilePageStore';

import s from './TeacherStats.module.scss';

type Props = {
  store: ProfilePageStore;
};

const TeacherStats: React.FC<Props> = ({ store }) => {
  const [showCompare, setShowCompare] = React.useState(false);

  const activeCourseIdsKey = store.activeCourses.map((c) => c.id).join();

  const courseOptions = React.useMemo(
    () =>
      store.activeCourses.map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [activeCourseIdsKey, store]
  );

  React.useEffect(() => {
    if (store.activeCourses.length === 0) {
      return;
    }

    const ids = new Set(store.activeCourses.map((c) => c.id));
    const needFix = store.selectedCourseId === null || !ids.has(store.selectedCourseId);
    const courseId = needFix ? store.activeCourses[0].id : store.selectedCourseId!;

    if (needFix) {
      store.setSelectedCourse(courseId);
    }

    store.applyStatsPeriodFromCourse(courseId);
    void store.loadStats(courseId);
  }, [store, activeCourseIdsKey, store.selectedCourseId]);

  const handleCourseChange = React.useCallback(
    (value: string) => {
      const id = Number(value);

      store.setSelectedCourse(id);
      store.applyStatsPeriodFromCourse(id);
      void store.loadStats(id);
    },
    [store]
  );

  const handleStatsPeriodChange = React.useCallback(
    ({ from, to }: { from: string; to: string }) => {
      store.setStatsPeriodFrom(from);
      store.setStatsPeriodTo(to);
    },
    [store]
  );

  const handleComparePeriodChange = React.useCallback(
    ({ from, to }: { from: string; to: string }) => {
      store.setComparePeriodFrom(from);
      store.setComparePeriodTo(to);
    },
    [store]
  );

  const handleRefresh = React.useCallback(() => {
    if (store.selectedCourseId) {
      void store.loadStats(store.selectedCourseId);
    }
  }, [store]);

  const handleCompare = React.useCallback(() => {
    if (store.selectedCourseId) {
      void store.loadCompareStats(store.selectedCourseId);
    }
  }, [store]);

  const handleExport = React.useCallback(() => {
    if (store.selectedCourseId) {
      void store.exportStatsCsv(store.selectedCourseId);
    }
  }, [store]);

  const stats = store.statsData;
  const compare = store.compareStatsData;

  return (
    <div className={s.root}>
      <div className={s.controls}>
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
        <div className={s.periodRow}>
          <div className={s.selector}>
            <label className={s.label}>Период</label>
            <DateRangePicker
              from={store.statsPeriodFrom}
              to={store.statsPeriodTo}
              onChange={handleStatsPeriodChange}
            />
          </div>
          <Button mode="dark" className={s.refreshBtn} onClick={handleRefresh}>
            Обновить
          </Button>
        </div>
      </div>
      {stats && (
        <>
          <div className={s.summaryCards}>
            <div className={s.card}>
              <div className={s.cardValue}>{stats.totalLessons}</div>
              <div className={s.cardLabel}>Всего занятий</div>
            </div>
            <div className={s.card}>
              <div className={s.cardValue}>{stats.conductedLessons}</div>
              <div className={s.cardLabel}>Проведено</div>
            </div>
            <div className={s.card}>
              <div className={s.cardValue}>{stats.cancelledLessons}</div>
              <div className={s.cardLabel}>Отменено</div>
            </div>
            <div className={s.card}>
              <div className={s.cardValue}>{stats.avgAttendancePercent}%</div>
              <div className={s.cardLabel}>Ср. посещаемость</div>
            </div>
            <div className={s.card}>
              <div className={s.cardValue}>{stats.totalStudents}</div>
              <div className={s.cardLabel}>Учеников</div>
            </div>
          </div>
          {stats.perLesson.length > 0 && (
            <div className={s.tableSection}>
              <h3 className={s.subTitle}>По занятиям</h3>
              <div className={s.tableScroll}>
                <div className={s.table}>
                  <div className={s.tableHeader}>
                    <span className={s.colDate}>Дата</span>
                    <span className={s.colNum}>Присут.</span>
                    <span className={s.colNum}>Отсут.</span>
                    <span className={cx(s.colNum, s.colTotalLabel)}>
                      <span className={s.colTotalLabelMain}>Всего</span>
                      <span className={s.colTotalLabelSub}>учеников</span>
                    </span>
                    <span className={s.colPct}>%</span>
                  </div>
                  {stats.perLesson.map((row) => (
                    <div key={row.lessonId} className={s.tableRow}>
                      <span className={s.colDate}>{row.date}</span>
                      <span className={s.colNum}>{row.present}</span>
                      <span className={s.colNum}>{row.absent}</span>
                      <span className={s.colNum}>{row.total}</span>
                      <span className={s.colPct}>
                        <span
                          className={s.percent}
                          style={{
                            color:
                              row.percent >= 70
                                ? '#a5d6a7'
                                : row.percent >= 40
                                  ? '#fff59d'
                                  : '#ef9a9a',
                          }}
                        >
                          {row.percent}%
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {stats.perStudent.length > 0 && (
            <div className={s.tableSection}>
              <h3 className={s.subTitle}>По ученикам</h3>
              <div className={s.tableScroll}>
                <div className={s.table}>
                  <div className={s.tableHeader}>
                    <span className={s.colName}>Имя</span>
                    <span className={s.colNum}>Присут.</span>
                    <span className={s.colNum}>Отсут.</span>
                    <span className={cx(s.colNum, s.colTotalLabel)}>
                      <span className={s.colTotalLabelMain}>Всего</span>
                      <span className={s.colTotalLabelSub}>занятий</span>
                    </span>
                    <span className={s.colPct}>%</span>
                  </div>
                  {stats.perStudent.map((row) => (
                    <div key={row.studentId} className={s.tableRow}>
                      <span className={s.colName}>{row.studentName}</span>
                      <span className={s.colNum}>{row.attended}</span>
                      <span className={s.colNum}>{row.missed}</span>
                      <span className={s.colNum}>{row.total}</span>
                      <span className={s.colPct}>
                        <span
                          className={s.percent}
                          style={{
                            color:
                              row.percent >= 70
                                ? '#a5d6a7'
                                : row.percent >= 40
                                  ? '#fff59d'
                                  : '#ef9a9a',
                          }}
                        >
                          {row.percent}%
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className={s.compareSection}>
            <Button mode="purple" className={s.exportBtn} onClick={handleExport}>
              Экспорт в CSV
            </Button>
            <button
              type="button"
              className={s.toggleCompare}
              onClick={() => setShowCompare(!showCompare)}
            >
              {showCompare ? 'Скрыть сравнение' : 'Сравнить периоды'}
            </button>
            {showCompare && (
              <div className={s.compareBlock}>
                <div className={s.periodRow}>
                  <div className={s.selector}>
                    <label className={s.label}>Сравнить с периодом</label>
                    <DateRangePicker
                      from={store.comparePeriodFrom}
                      to={store.comparePeriodTo}
                      onChange={handleComparePeriodChange}
                    />
                  </div>
                  <Button mode="dark" className={s.refreshBtn} onClick={handleCompare}>
                    Сравнить
                  </Button>
                </div>
                {compare && (
                  <div className={s.compareResults}>
                    <div className={s.compareRow}>
                      <span className={s.compareLabel}>Период 1 (текущий)</span>
                      <span className={s.compareValue}>{stats.avgAttendancePercent}%</span>
                    </div>
                    <div className={s.compareRow}>
                      <span className={s.compareLabel}>Период 2</span>
                      <span className={s.compareValue}>{compare.avgAttendancePercent}%</span>
                    </div>
                    <div className={s.compareRow}>
                      <span className={s.compareLabel}>Разница</span>
                      <span
                        className={s.compareValue}
                        style={{
                          color:
                            stats.avgAttendancePercent >= compare.avgAttendancePercent
                              ? '#a5d6a7'
                              : '#ef9a9a',
                        }}
                      >
                        {stats.avgAttendancePercent - compare.avgAttendancePercent > 0 ? '+' : ''}
                        {stats.avgAttendancePercent - compare.avgAttendancePercent}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default observer(TeacherStats);
