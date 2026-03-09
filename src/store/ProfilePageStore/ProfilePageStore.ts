import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import type {
  AttendanceRecord,
  AttendanceStats,
  CourseFormData,
  Lesson,
  TeacherCourse,
} from 'config/teacher';
import { MockDb } from 'services/mockDb';
import type { MockUserData } from 'services/mockDb/types';
import { ILocalStore } from 'store/interfaces';

export type ProfileSection =
  | 'profile'
  | 'enrollments'
  | 'favorites'
  | 'teacherCourses'
  | 'students'
  | 'stats';

export type ViewMode = 'student' | 'teacher';

const MOCK_TEACHER_ID = 11;

const EMPTY_FORM: CourseFormData = {
  name: '',
  type: '',
  level: 'Начинающие',
  dateFrom: '',
  dateTo: '',
  price: 0,
  studio: '',
  city: '',
  description: '',
  capacity: 20,
  schedule: [{ weekday: 'Пн', timeFrom: '18:00', timeTo: '19:30' }],
};

export class ProfilePageStore implements ILocalStore {
  activeSection: ProfileSection = 'profile';
  viewMode: ViewMode = 'student';

  teacherCourses: TeacherCourse[] = [];
  selectedCourseId: number | null = null;
  lessons: Lesson[] = [];
  students: MockUserData[] = [];
  attendanceData: AttendanceRecord[] = [];
  statsData: AttendanceStats | null = null;

  isFormOpen = false;
  editingCourseId: number | null = null;
  courseFormData: CourseFormData = { ...EMPTY_FORM };

  statsPeriodFrom = '';
  statsPeriodTo = '';
  comparePeriodFrom = '';
  comparePeriodTo = '';
  compareStatsData: AttendanceStats | null = null;

  isLoading = false;

  constructor() {
    makeObservable(this, {
      activeSection: observable,
      viewMode: observable,
      teacherCourses: observable.ref,
      selectedCourseId: observable,
      lessons: observable.ref,
      students: observable.ref,
      attendanceData: observable.ref,
      statsData: observable.ref,
      isFormOpen: observable,
      editingCourseId: observable,
      courseFormData: observable,
      statsPeriodFrom: observable,
      statsPeriodTo: observable,
      comparePeriodFrom: observable,
      comparePeriodTo: observable,
      compareStatsData: observable.ref,
      isLoading: observable,

      isTeacherView: computed,
      mockTeacherId: computed,
      activeCourses: computed,
      selectedCourse: computed,

      setViewMode: action,
      setSection: action,
      setSelectedCourse: action,
      openCreateForm: action,
      openEditForm: action,
      closeForm: action,
      updateFormField: action,
      addScheduleEntry: action,
      removeScheduleEntry: action,
      updateScheduleEntry: action,
      setStatsPeriodFrom: action,
      setStatsPeriodTo: action,
      setComparePeriodFrom: action,
      setComparePeriodTo: action,
    });
  }

  get isTeacherView(): boolean {
    return this.viewMode === 'teacher';
  }

  get mockTeacherId(): number {
    return MOCK_TEACHER_ID;
  }

  get activeCourses(): TeacherCourse[] {
    return this.teacherCourses.filter((c) => c.courseStatus === 'active');
  }

  get selectedCourse(): TeacherCourse | undefined {
    return this.teacherCourses.find((c) => c.id === this.selectedCourseId);
  }

  setViewMode = (mode: ViewMode): void => {
    this.viewMode = mode;

    if (mode === 'teacher') {
      this.activeSection = 'teacherCourses';
      this.loadTeacherCourses(MOCK_TEACHER_ID);

      if (this.teacherCourses.length > 0) {
        const firstId = this.teacherCourses[0].id;

        this.setSelectedCourse(firstId);
        this.loadStats(firstId);
      }
    } else {
      this.activeSection = 'profile';
    }
  };

  setSection = (section: ProfileSection): void => {
    this.activeSection = section;
  };

  setSelectedCourse = (courseId: number | null): void => {
    this.selectedCourseId = courseId;

    if (courseId) {
      this.loadLessons(courseId);
      this.loadStudents(courseId);
      this.loadAttendance(courseId);
    }
  };

  // ── Form management ──────────────────────────────────────────────────

  openCreateForm = (): void => {
    this.editingCourseId = null;
    this.courseFormData = {
      ...EMPTY_FORM,
      schedule: [{ weekday: 'Пн', timeFrom: '18:00', timeTo: '19:30' }],
    };
    this.isFormOpen = true;
  };

  openEditForm = (course: TeacherCourse): void => {
    this.editingCourseId = course.id;
    this.courseFormData = {
      name: course.name,
      type: course.type,
      level: course.level,
      dateFrom: course.dateFrom,
      dateTo: course.dateTo,
      price: course.price,
      studio: course.studio,
      city: course.city,
      description: course.description,
      capacity: course.capacity,
      schedule: (course.schedule ?? []).map((s) => ({
        weekday: s.weekday,
        timeFrom: s.timeFrom,
        timeTo: s.timeTo,
        location: s.location,
      })),
    };
    this.isFormOpen = true;
  };

  closeForm = (): void => {
    this.isFormOpen = false;
    this.editingCourseId = null;
  };

  updateFormField = <K extends keyof CourseFormData>(field: K, value: CourseFormData[K]): void => {
    this.courseFormData[field] = value;
  };

  addScheduleEntry = (): void => {
    this.courseFormData.schedule.push({ weekday: 'Пн', timeFrom: '18:00', timeTo: '19:30' });
  };

  removeScheduleEntry = (index: number): void => {
    this.courseFormData.schedule.splice(index, 1);
  };

  updateScheduleEntry = (index: number, field: string, value: string): void => {
    const entry = this.courseFormData.schedule[index];

    if (entry) {
      (entry as Record<string, string>)[field] = value;
    }
  };

  setStatsPeriodFrom = (v: string): void => {
    this.statsPeriodFrom = v;
  };

  setStatsPeriodTo = (v: string): void => {
    this.statsPeriodTo = v;
  };

  setComparePeriodFrom = (v: string): void => {
    this.comparePeriodFrom = v;
  };

  setComparePeriodTo = (v: string): void => {
    this.comparePeriodTo = v;
  };

  // ── Data loading ─────────────────────────────────────────────────────

  loadTeacherCourses = (teacherId: number): void => {
    const courses = MockDb.getTeacherCourses(teacherId);

    runInAction(() => {
      this.teacherCourses = courses;

      if (courses.length > 0 && !this.selectedCourseId) {
        this.selectedCourseId = courses[0].id;
      }
    });
  };

  loadLessons = (courseId: number): void => {
    const lessons = MockDb.getCourseLessons(courseId);

    runInAction(() => {
      this.lessons = lessons;
    });
  };

  loadStudents = (courseId: number): void => {
    const students = MockDb.getCourseStudents(courseId);

    runInAction(() => {
      this.students = students;
    });
  };

  loadAttendance = (courseId: number): void => {
    const records = MockDb.getAttendanceByCourse(courseId);

    runInAction(() => {
      this.attendanceData = records;
    });
  };

  loadStats = (courseId: number): void => {
    const stats = MockDb.getAttendanceStats(
      courseId,
      this.statsPeriodFrom || undefined,
      this.statsPeriodTo || undefined
    );

    runInAction(() => {
      this.statsData = stats;
    });
  };

  loadCompareStats = (courseId: number): void => {
    if (!this.comparePeriodFrom || !this.comparePeriodTo) {
      return;
    }

    const stats = MockDb.getAttendanceStats(courseId, this.comparePeriodFrom, this.comparePeriodTo);

    runInAction(() => {
      this.compareStatsData = stats;
    });
  };

  // ── Teacher actions ──────────────────────────────────────────────────

  createCourse = async (teacherId: number): Promise<void> => {
    runInAction(() => {
      this.isLoading = true;
    });

    await MockDb.createTeacherCourse(teacherId, this.courseFormData);

    runInAction(() => {
      this.isLoading = false;
      this.isFormOpen = false;
      this.loadTeacherCourses(teacherId);
    });
  };

  updateCourse = async (teacherId: number): Promise<void> => {
    if (!this.editingCourseId) {
      return;
    }

    runInAction(() => {
      this.isLoading = true;
    });

    await MockDb.updateTeacherCourse(this.editingCourseId, this.courseFormData);

    runInAction(() => {
      this.isLoading = false;
      this.isFormOpen = false;
      this.editingCourseId = null;
      this.loadTeacherCourses(teacherId);
    });
  };

  cancelCourse = async (courseId: number, teacherId: number): Promise<void> => {
    await MockDb.cancelTeacherCourse(courseId);
    this.loadTeacherCourses(teacherId);

    if (this.selectedCourseId === courseId) {
      this.loadLessons(courseId);
    }
  };

  cancelLesson = async (lessonId: number): Promise<void> => {
    await MockDb.cancelLesson(lessonId);

    if (this.selectedCourseId) {
      this.loadLessons(this.selectedCourseId);
    }
  };

  markAttendance = async (lessonId: number, studentId: number, present: boolean): Promise<void> => {
    await MockDb.markAttendance(lessonId, studentId, present);

    if (this.selectedCourseId) {
      this.loadAttendance(this.selectedCourseId);
    }
  };

  exportStatsCsv = (courseId: number): void => {
    const stats = MockDb.getAttendanceStats(
      courseId,
      this.statsPeriodFrom || undefined,
      this.statsPeriodTo || undefined
    );

    const rows: string[] = [];

    rows.push('Тип,Имя/Дата,Посещено,Пропущено,Всего,Процент');

    for (const s of stats.perStudent) {
      rows.push(`Ученик,"${s.studentName}",${s.attended},${s.missed},${s.total},${s.percent}%`);
    }

    for (const l of stats.perLesson) {
      rows.push(`Занятие,${l.date},${l.present},${l.absent},${l.total},${l.percent}%`);
    }

    const bom = '\uFEFF';
    const blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `attendance_course_${courseId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  destroy = (): void => {};
}
