import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import type {
  AttendanceRecord,
  AttendanceStats,
  CourseFormData,
  Lesson,
  TeacherCourse,
} from 'config/teacher';
import { UserRole, type BackendTeacherProfile, type BackendUser } from 'entities/user';
import { MockDb } from 'services/mockDb';
import type { MockUserData } from 'services/mockDb/types';
import { ErrorResponse } from 'store/globals/api/types';
import { type IRootStore } from 'store/globals/root/declaration';
import { ILocalStore } from 'store/interfaces';
import { IApiRequest } from 'store/models/ApiRequest/declaration';

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

const EMPTY_TEACHER_PROFILE_FORM = {
  bio: '',
  experience: '',
  specializations: '',
  achievements: '',
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export class ProfilePageStore implements ILocalStore {
  private readonly _rootStore: IRootStore;
  private readonly _requests: {
    updateUser: IApiRequest<BackendUser, ErrorResponse>;
    updateTeacherProfile: IApiRequest<BackendTeacherProfile, ErrorResponse>;
  };

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
  isEditingProfile = false;
  isSavingProfile = false;
  profileError: string | null = null;
  profileForm = {
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
  };

  avatarFile: File | null = null;
  avatarPreview = '';
  teacherProfileForm = { ...EMPTY_TEACHER_PROFILE_FORM };
  teacherImagePreviews: string[] = [];
  teacherRating = 0;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;
    this.viewMode =
      this._rootStore.userStore.user?.role === UserRole.teacher ? 'teacher' : 'student';
    this._requests = {
      updateUser: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.auth.updateUser,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      updateTeacherProfile: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.teachers.update(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
    };

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
      isEditingProfile: observable,
      isSavingProfile: observable,
      profileError: observable,
      profileForm: observable,
      avatarFile: observable.ref,
      avatarPreview: observable,
      teacherProfileForm: observable,
      teacherImagePreviews: observable.ref,
      teacherRating: observable,

      isTeacherView: computed,
      mockTeacherId: computed,
      activeCourses: computed,
      selectedCourse: computed,
      teacherDisplayName: computed,

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
      startProfileEdit: action,
      cancelProfileEdit: action,
      updateProfileField: action,
      setAvatarFile: action,
      updateTeacherField: action,
      removeTeacherImage: action,
      saveProfile: action,
    });

    if (this.viewMode === 'teacher') {
      this.loadTeacherCourses(MOCK_TEACHER_ID);
      this.syncTeacherProfileFromUser();

      if (this.teacherCourses.length > 0) {
        const firstId = this.teacherCourses[0].id;

        this.setSelectedCourse(firstId);
        this.loadStats(firstId);
      }
    }
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

  get teacherDisplayName(): string {
    const user = this._rootStore.userStore.user;

    if (!user) {
      return 'Преподаватель';
    }

    return (
      [user.lastName, user.firstName].filter(Boolean).join(' ') || user.username || 'Преподаватель'
    );
  }

  setViewMode = (mode: ViewMode): void => {
    this.viewMode = mode;

    if (mode === 'teacher') {
      this.activeSection = 'profile';
      this.loadTeacherCourses(MOCK_TEACHER_ID);
      this.syncTeacherProfileFromUser();

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

  startProfileEdit = (user: {
    username: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    avatar?: string;
  }): void => {
    this.isEditingProfile = true;
    this.profileError = null;
    this.profileForm = {
      username: user.username,
      firstName: user.firstName,
      middleName: user.middleName ?? '',
      lastName: user.lastName,
    };
    this.avatarFile = null;
    this.avatarPreview = user.avatar ?? '';
    this.syncTeacherProfileFromUser();
  };

  cancelProfileEdit = (): void => {
    this.isEditingProfile = false;
    this.isSavingProfile = false;
    this.profileError = null;
    this.avatarFile = null;
    this.syncTeacherProfileFromUser();
  };

  updateProfileField = (field: keyof typeof this.profileForm, value: string): void => {
    this.profileForm[field] = value;
  };

  setAvatarFile = (file: File | null): void => {
    this.avatarFile = file;
    this.avatarPreview = file ? URL.createObjectURL(file) : '';
  };

  updateTeacherField = (field: keyof typeof this.teacherProfileForm, value: string): void => {
    this.teacherProfileForm[field] = value;
  };

  addTeacherImages = async (files: FileList | File[]): Promise<void> => {
    const nextFiles = Array.from(files);

    if (nextFiles.length === 0) {
      return;
    }

    const previews = await Promise.all(nextFiles.map((file) => readFileAsDataUrl(file)));

    runInAction(() => {
      this.teacherImagePreviews = [...this.teacherImagePreviews, ...previews.filter(Boolean)];
    });
  };

  removeTeacherImage = (index: number): void => {
    this.teacherImagePreviews = [
      ...this.teacherImagePreviews.slice(0, index),
      ...this.teacherImagePreviews.slice(index + 1),
    ];
  };

  saveProfile = async (): Promise<boolean> => {
    runInAction(() => {
      this.isSavingProfile = true;
      this.profileError = null;
    });

    const formData = new FormData();

    formData.append('username', this.profileForm.username.trim());
    formData.append('first_name', this.profileForm.firstName.trim());
    formData.append('middle_name', this.profileForm.middleName.trim());
    formData.append('last_name', this.profileForm.lastName.trim());

    if (this.avatarFile) {
      formData.append('avatar_file', this.avatarFile);
    }

    const response = await this._requests.updateUser.call({
      data: formData,
    });

    if (response.isError) {
      runInAction(() => {
        this.isSavingProfile = false;
        this.profileError = 'Не удалось сохранить профиль.';
      });

      return false;
    }

    if (this.viewMode === 'teacher' || this._rootStore.userStore.user?.role === UserRole.teacher) {
      const teacherResponse = await this._requests.updateTeacherProfile.call({
        url: ENDPOINTS.teachers.update(0).url,
        data: {
          bio: this.teacherProfileForm.bio.trim(),
          images: this.teacherImagePreviews,
          achievements: this.teacherProfileForm.achievements
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          experience: Number(this.teacherProfileForm.experience) || 0,
          specializations: this.teacherProfileForm.specializations
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });

      if (teacherResponse.isError) {
        runInAction(() => {
          this.isSavingProfile = false;
          this.profileError = 'Не удалось сохранить данные преподавателя.';
        });

        return false;
      }
    }

    const normalizedUser = await this._rootStore.userStore.requestUser();

    runInAction(() => {
      this.isSavingProfile = false;
      this.isEditingProfile = false;
      this.profileError = null;
      this.avatarFile = null;
      this.avatarPreview = normalizedUser?.avatar ?? '';
    });

    if (normalizedUser?.role === UserRole.teacher) {
      this.syncTeacherProfileFromUser();
    } else {
      this.applyTeacherProfile(null);
    }

    return true;
  };

  applyTeacherProfile = (teacherProfile: BackendTeacherProfile | null | undefined): void => {
    runInAction(() => {
      this.teacherProfileForm = {
        bio: teacherProfile?.bio ?? '',
        experience: teacherProfile?.experience ? String(teacherProfile.experience) : '',
        specializations: (teacherProfile?.specializations ?? []).join('\n'),
        achievements: (teacherProfile?.achievements ?? []).join('\n'),
      };
      this.teacherImagePreviews = teacherProfile?.images ?? [];
      this.teacherRating = teacherProfile?.rating ?? 0;
    });
  };

  syncTeacherProfileFromUser = (): void => {
    this.applyTeacherProfile(this._rootStore.userStore.user?.teacher);
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
