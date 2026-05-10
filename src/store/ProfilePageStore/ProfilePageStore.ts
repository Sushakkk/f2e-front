import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
import { ENDPOINTS } from 'config/api';
import type { ScheduleEntry } from 'config/cards';
import type { CourseLevel } from 'config/levels';
import type {
  AttendanceRecord,
  AttendanceStats,
  CourseFormData,
  Lesson,
  TeacherCourse,
  TeacherCourseStatus,
} from 'config/teacher';
import type { Enrollment, EnrollmentStatus } from 'config/users';
import type { CityServer } from 'entities/city';
import { normalizeCourseDetail } from 'entities/course';
import {
  API_TO_WEEKDAY,
  LEVEL_FROM_API,
  LEVEL_TO_API,
  PROFILE_PAGE_MOCK_TEACHER_ID,
  PROFILE_PAGE_REFERENCE_YEAR,
  WEEKDAY_TO_API,
} from 'entities/course/config';
import type { CourseDetailServer, ScheduleEntryServer } from 'entities/course/server';
import {
  normalizeCourseAttendance,
  type CourseAttendanceResponseServer,
  type CourseAttendanceServer,
  type MarkAttendancePayloadServer,
} from 'entities/courseAttendance';
import {
  normalizeCourseAttendanceStats,
  type CourseAttendanceStatsServer,
} from 'entities/courseAttendanceStats';
import {
  normalizeCourseLesson,
  type CourseLessonServer,
  type CourseLessonsResponseServer,
} from 'entities/courseLessons';
import {
  normalizeCourseStudent,
  type CourseStudentClient,
  type CourseStudentsResponseServer,
} from 'entities/courseStudents';
import type { StudioServer } from 'entities/studio';
import {
  UserRole,
  type BackendTeacherProfile,
  type BackendUser,
  type UserClient,
} from 'entities/user';
import { ErrorResponse } from 'store/globals/api/types';
import { type IRootStore } from 'store/globals/root/declaration';
import { ILocalStore } from 'store/interfaces';
import { IApiRequest } from 'store/models/ApiRequest/declaration';
import { resolveCourseImageFetchUrl } from 'utils/courseImageFetchUrl';
import { ddmmToIso, formatClockToHhMm, fromIsoDate } from 'utils/dateUtils';
import {
  buildAttendanceStatsCsvContent,
  buildAttendanceStatsExportFileName,
} from 'utils/exportAttendanceStatsCsv';

export type ProfileSection =
  | 'profile'
  | 'enrollments'
  | 'favorites'
  | 'calendar'
  | 'teacherCourses'
  | 'students'
  | 'stats';

export type ViewMode = 'student' | 'teacher';

type CourseFormErrors = Record<string, string>;
type CourseApiErrorResponse = ErrorResponse & Record<string, unknown>;
type ProfileFormErrors = Partial<Record<'username' | 'firstName' | 'lastName', string>>;

const TIME_HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function buildAttendanceStatsQueryParams(dateFrom: string, dateTo: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (dateFrom.trim()) {
    params.date_from = dateFrom.trim();
  }

  if (dateTo.trim()) {
    params.date_to = dateTo.trim();
  }

  return params;
}

const isValidDDMM = (value: string): boolean => {
  const match = /^(\d{2})\.(\d{2})$/.exec(value.trim());

  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);

  if (day <= 0 || month <= 0 || month > 12) {
    return false;
  }

  const date = new Date(PROFILE_PAGE_REFERENCE_YEAR, month - 1, day);

  return (
    date.getFullYear() === PROFILE_PAGE_REFERENCE_YEAR &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const toComparableTime = (value: string): number => {
  const [hours, minutes] = value.split(':').map((part) => Number(part));

  return hours * 60 + minutes;
};

const EMPTY_FORM: CourseFormData = {
  name: '',
  type: '',
  level: 'РќР°С‡РёРЅР°СЋС‰РёРµ',
  dateFrom: '',
  dateTo: '',
  price: '',
  studio: '',
  city: '',
  description: '',
  musicUrl: '',
  capacity: '',
  useSameLocation: true,
  sharedLocation: '',
  schedule: [{ weekday: '', timeFrom: '', timeTo: '' }],
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

const formatIsoDateForUi = (iso: string): string => {
  if (!iso) {
    return '';
  }

  const d = new Date(iso);

  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getLevelLabelFromApi = (level: string): CourseLevel =>
  LEVEL_FROM_API[level as keyof typeof LEVEL_FROM_API] ?? 'Р›СЋР±РѕР№ СѓСЂРѕРІРµРЅСЊ';

const mapApiCourseStatusToTeacherCourseStatus = (status: string): TeacherCourseStatus => {
  if (status === 'completed') {
    return 'completed';
  }

  if (status === 'cancelled') {
    return 'cancelled';
  }

  return 'active';
};

const mapCourseStatusToEnrollmentFields = (
  status: string
): { status: EnrollmentStatus; courseStatus?: EnrollmentStatus } => {
  if (status === 'cancelled') {
    return { status: 'cancelled', courseStatus: 'cancelled' };
  }

  if (status === 'completed') {
    return { status: 'completed', courseStatus: 'completed' };
  }

  return { status: 'active', courseStatus: undefined };
};

const normalizeScheduleEntryForTeacherCourse = (entry: ScheduleEntryServer): ScheduleEntry => ({
  weekday: entry.weekday,
  timeFrom: formatClockToHhMm(entry.time_from),
  timeTo: formatClockToHhMm(entry.time_to),
  location: entry.location ?? undefined,
});

const normalizeCourseDetailToEnrollment = (data: CourseDetailServer): Enrollment => {
  const { status, courseStatus } = mapCourseStatusToEnrollmentFields(data.status);

  return {
    courseId: data.id,
    enrolledAt: '',
    status,
    paid: false,
    courseStatus,
    courseDateTo: data.date_to,
    course: normalizeCourseDetail(data),
  };
};

const normalizeMyTeachingCourseToTeacherCourse = (
  row: CourseDetailServer,
  user: UserClient
): TeacherCourse => {
  const teacherDisplayName =
    [user.lastName, user.firstName].filter(Boolean).join(' ') || user.username || 'РџСЂРµРїРѕРґР°РІР°С‚РµР»СЊ';
  const rawPrice = row.price as number | string | undefined;
  const priceNum = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);

  return {
    id: row.id,
    name: row.name,
    type: row.dance_style,
    teacher: {
      name: teacherDisplayName,
      bio: '',
      images: [],
      achievements: [],
      experience: 0,
      specializations: [],
      rating: 0,
      reviews: [],
    },
    level: getLevelLabelFromApi(row.level),
    dateFrom: formatIsoDateForUi(row.date_from),
    dateTo: formatIsoDateForUi(row.date_to),
    price: Number.isFinite(priceNum) ? priceNum : 0,
    images: row.images ?? [],
    studio: row.studio,
    city: row.city ?? '',
    description: row.description ?? '',
    capacity: row.capacity ?? 0,
    spotsLeft: row.spots_left ?? 0,
    schedule: (row.schedule ?? []).map(normalizeScheduleEntryForTeacherCourse),
    music: row.music ?? { artist: '', track: '', url: '' },
    canEnroll: row.can_enroll ?? true,
    canCancelEnrollment: row.can_cancel_enrollment ?? true,
    canEdit: row.can_edit ?? true,
    firstLessonAt: row.first_lesson_at ?? undefined,
    createdByTeacherId: user.id,
    courseStatus: mapApiCourseStatusToTeacherCourseStatus(row.status),
    dateRangeFromIso: row.date_from ? row.date_from.slice(0, 10) : undefined,
    dateRangeToIso: row.date_to ? row.date_to.slice(0, 10) : undefined,
  };
};

const normalizeApiCourseToTeacherCourse = (
  data: CourseDetailServer,
  apiStatus: string,
  user: BackendUser | null | undefined
): TeacherCourse => {
  const client = normalizeCourseDetail(data);

  return {
    ...client,
    createdByTeacherId: data.teacher_id ?? user?.id ?? 0,
    courseStatus: mapApiCourseStatusToTeacherCourseStatus(apiStatus),
    dateRangeFromIso: data.date_from ? data.date_from.slice(0, 10) : undefined,
    dateRangeToIso: data.date_to ? data.date_to.slice(0, 10) : undefined,
  };
};

export class ProfilePageStore implements ILocalStore {
  private readonly _rootStore: IRootStore;
  private readonly _requests: {
    updateUser: IApiRequest<BackendUser, ErrorResponse>;
    updateTeacherProfile: IApiRequest<BackendTeacherProfile, ErrorResponse>;
    cities: IApiRequest<CityServer[], ErrorResponse>;
    studios: IApiRequest<StudioServer[], ErrorResponse>;
    teacherCourses: IApiRequest<CourseDetailServer[], ErrorResponse>;
    enrollments: IApiRequest<CourseDetailServer[], ErrorResponse>;
    courseDetail: IApiRequest<CourseDetailServer, ErrorResponse>;
    courseStudents: IApiRequest<CourseStudentsResponseServer, ErrorResponse>;
    courseLessons: IApiRequest<CourseLessonsResponseServer, ErrorResponse>;
    courseAttendance: IApiRequest<CourseAttendanceResponseServer, ErrorResponse>;
    attendanceStats: IApiRequest<CourseAttendanceStatsServer, ErrorResponse>;
    markAttendance: IApiRequest<CourseAttendanceServer, ErrorResponse>;
    createCourse: IApiRequest<CourseDetailServer, ErrorResponse>;
    updateCourse: IApiRequest<CourseDetailServer, ErrorResponse>;
    cancelLessonRequest: IApiRequest<CourseLessonServer, ErrorResponse>;
  };

  activeSection: ProfileSection = 'profile';
  viewMode: ViewMode = 'student';

  teacherCourses: TeacherCourse[] = [];
  enrollments: Enrollment[] = [];
  cities: CityServer[] = [];
  studios: StudioServer[] = [];
  selectedCourseId: number | null = null;
  lessons: Lesson[] = [];

  /** Р—Р°РЅСЏС‚РёСЏ РєСѓСЂСЃР° РІ С„РѕСЂРјРµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ (СЃРїРёСЃРѕРє GET /courses/:id/lessons/) */
  courseFormLessons: Lesson[] = [];
  students: CourseStudentClient[] = [];
  attendanceData: AttendanceRecord[] = [];
  statsData: AttendanceStats | null = null;

  isFormOpen = false;
  editingCourseId: number | null = null;
  courseFormData: CourseFormData = { ...EMPTY_FORM };
  courseFormErrors: CourseFormErrors = {};

  statsPeriodFrom = '';
  statsPeriodTo = '';
  comparePeriodFrom = '';
  comparePeriodTo = '';
  compareStatsData: AttendanceStats | null = null;

  isLoading = false;
  isEditingProfile = false;
  isSavingProfile = false;
  profileError: string | null = null;
  profileFormErrors: ProfileFormErrors = {};
  profileForm = {
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
  };

  avatarFile: File | null = null;
  avatarPreview = '';

  /** РџР°СЂР°Р»Р»РµР»СЊРЅРѕ courseImagePreviews: null = СѓР¶Рµ СЃРѕС…СЂР°РЅС‘РЅРЅРѕРµ С„РѕС‚Рѕ (URL), File = РЅРѕРІР°СЏ Р·Р°РіСЂСѓР·РєР° */
  courseImageFileSlots: (File | null)[] = [];
  courseImagePreviews: string[] = [];
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
      cities: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.dictionaries.cities,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      studios: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.dictionaries.studios,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      teacherCourses: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.teachers.myCourses,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      enrollments: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.enrollments.list,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      courseDetail: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.detail(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      courseStudents: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.students(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      courseLessons: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.lessons(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      courseAttendance: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.attendance(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      attendanceStats: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.attendanceStats(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      markAttendance: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.lessons.markAttendance(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      createCourse: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.create,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      updateCourse: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.update(0),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      cancelLessonRequest: this._rootStore.apiStore.createExtendedRequest<
        CourseLessonServer,
        ErrorResponse
      >({
        ...ENDPOINTS.lessons.cancel(0),
        showExpectedError: true,
        showUnexpectedError: true,
      }),
    };

    makeObservable(this, {
      activeSection: observable,
      viewMode: observable,
      teacherCourses: observable.ref,
      enrollments: observable.ref,
      cities: observable.ref,
      studios: observable.ref,
      selectedCourseId: observable,
      lessons: observable.ref,
      courseFormLessons: observable.ref,
      students: observable.ref,
      attendanceData: observable.ref,
      statsData: observable.ref,
      isFormOpen: observable,
      editingCourseId: observable,
      courseFormData: observable,
      courseFormErrors: observable,
      statsPeriodFrom: observable,
      statsPeriodTo: observable,
      comparePeriodFrom: observable,
      comparePeriodTo: observable,
      compareStatsData: observable.ref,
      isLoading: observable,
      isEditingProfile: observable,
      isSavingProfile: observable,
      profileError: observable,
      profileFormErrors: observable,
      profileForm: observable,
      avatarFile: observable.ref,
      avatarPreview: observable,
      courseImageFileSlots: observable.ref,
      courseImagePreviews: observable.ref,
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
      updateSharedLocation: action,
      setUseSameLocation: action,
      clearCourseFormError: action,
      addScheduleEntry: action,
      removeScheduleEntry: action,
      updateScheduleEntry: action,
      setStatsPeriodFrom: action,
      setStatsPeriodTo: action,
      setComparePeriodFrom: action,
      setComparePeriodTo: action,
      applyStatsPeriodFromCourse: action,
      startProfileEdit: action,
      cancelProfileEdit: action,
      updateProfileField: action,
      clearProfileFormError: action,
      setAvatarFile: action,
      setCourseImageFiles: action,
      removeCourseImage: action,
      moveCourseImage: action,
      updateTeacherField: action,
      removeTeacherImage: action,
      saveProfile: action,
    });

    if (this.viewMode === 'teacher') {
      this.syncTeacherProfileFromUser();
    }
  }

  get isTeacherView(): boolean {
    return this.viewMode === 'teacher';
  }

  get mockTeacherId(): number {
    return PROFILE_PAGE_MOCK_TEACHER_ID;
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
      return 'РџСЂРµРїРѕРґР°РІР°С‚РµР»СЊ';
    }

    return (
      [user.lastName, user.firstName].filter(Boolean).join(' ') || user.username || 'РџСЂРµРїРѕРґР°РІР°С‚РµР»СЊ'
    );
  }

  setViewMode = (mode: ViewMode): void => {
    this.viewMode = mode;

    if (mode === 'teacher') {
      this.activeSection = 'profile';
      this.syncTeacherProfileFromUser();
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
      this.students = [];
      this.lessons = [];
      this.attendanceData = [];
      void this.loadLessons(courseId);
      void this.loadStudents(courseId);
      void this.loadAttendance(courseId);
    } else {
      this.students = [];
      this.lessons = [];
      this.attendanceData = [];
    }
  };

  // в”Ђв”Ђ Form management в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

  openCreateForm = (): void => {
    this.editingCourseId = null;
    this.courseFormErrors = {};
    this.courseImageFileSlots = [];
    this.courseImagePreviews = [];
    this.courseFormData = { ...EMPTY_FORM };
    this.courseFormLessons = [];
    this.isFormOpen = true;
  };

  openEditForm = async (courseId: number): Promise<void> => {
    if (this.isLoading) {
      return;
    }

    runInAction(() => {
      this.isLoading = true;
    });

    const response = await this._requests.courseDetail.call({
      url: ENDPOINTS.courses.detail(courseId).url,
    });

    if (response.isError) {
      runInAction(() => {
        this.isLoading = false;
      });

      this._rootStore.snackbarStore.triggerDefaultErrorMessage();

      return;
    }

    runInAction(() => {
      const normalizedSchedule =
        response.data.schedule.length > 0
          ? response.data.schedule.map((entry) => ({
              weekday: API_TO_WEEKDAY[entry.weekday as keyof typeof API_TO_WEEKDAY] ?? entry.weekday,
              timeFrom: formatClockToHhMm(entry.time_from),
              timeTo: formatClockToHhMm(entry.time_to),
              location: entry.location ?? undefined,
            }))
          : [{ weekday: '', timeFrom: '', timeTo: '', location: undefined }];
      const filledLocations = normalizedSchedule
        .map((entry) => (entry.location ?? '').trim())
        .filter(Boolean);
      const uniqueLocations = Array.from(new Set(filledLocations));
      const useSameLocation =
        normalizedSchedule.length > 0 &&
        uniqueLocations.length === 1 &&
        normalizedSchedule.every((entry) => (entry.location ?? '').trim().length > 0);

      this.editingCourseId = courseId;
      this.courseFormErrors = {};
      this.courseImageFileSlots = response.data.images.map(() => null);
      this.courseImagePreviews = response.data.images;
      this.courseFormData = {
        name: response.data.name,
        type: response.data.dance_style,
        level: getLevelLabelFromApi(response.data.level),
        dateFrom: formatIsoDateForUi(response.data.date_from),
        dateTo: formatIsoDateForUi(response.data.date_to),
        price: String(response.data.price),
        studio: response.data.studio,
        city: response.data.city,
        description: response.data.description,
        musicUrl: response.data.music.url,
        capacity: String(response.data.capacity ?? ''),
        useSameLocation,
        sharedLocation: useSameLocation ? uniqueLocations[0] ?? '' : '',
        schedule: normalizedSchedule,
      };
      this.isFormOpen = true;
      this.isLoading = false;
    });

    void this.loadCourseFormLessons(courseId);
  };

  closeForm = (): void => {
    this.isFormOpen = false;
    this.editingCourseId = null;
    this.courseFormErrors = {};
    this.courseImageFileSlots = [];
    this.courseImagePreviews = [];
    this.courseFormLessons = [];
  };

  updateFormField = <K extends keyof CourseFormData>(field: K, value: CourseFormData[K]): void => {
    this.courseFormData[field] = value;
    this.clearCourseFormError(field);

    if (field === 'studio') {
      const studio = this.studios.find((item) => item.name === value);

      if (studio) {
        this.courseFormData.city = studio.city;
        this.clearCourseFormError('city');
      }
    }
  };

  updateSharedLocation = (value: string): void => {
    this.courseFormData.sharedLocation = value;
    this.clearCourseFormError('sharedLocation');
  };

  setUseSameLocation = (value: boolean): void => {
    this.courseFormData.useSameLocation = value;
    this.clearCourseFormError('sharedLocation');

    if (value) {
      Object.keys(this.courseFormErrors)
        .filter((key) => key.startsWith('schedule.') && key.endsWith('.location'))
        .forEach((key) => this.clearCourseFormError(key));
    }
  };

  clearCourseFormError = (field: string): void => {
    if (!this.courseFormErrors[field]) {
      return;
    }

    const next = { ...this.courseFormErrors };

    delete next[field];
    this.courseFormErrors = next;
  };

  addScheduleEntry = (): void => {
    this.courseFormData.schedule.push({ weekday: '', timeFrom: '', timeTo: '' });
    this.clearCourseFormError('schedule');
  };

  removeScheduleEntry = (index: number): void => {
    this.courseFormData.schedule.splice(index, 1);
    Object.keys(this.courseFormErrors)
      .filter((key) => key.startsWith(`schedule.${index}.`) || key === 'schedule')
      .forEach((key) => this.clearCourseFormError(key));
  };

  updateScheduleEntry = (index: number, field: string, value: string): void => {
    const entry = this.courseFormData.schedule[index];

    if (entry) {
      (entry as Record<string, string>)[field] = value;
      this.clearCourseFormError(`schedule.${index}.${field}`);
      this.clearCourseFormError('schedule');
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

  /**
   * Р—Р°РїРѕР»РЅСЏРµС‚ РїРµСЂРёРѕРґ СЃС‚Р°С‚РёСЃС‚РёРєРё РґР°С‚Р°РјРё РІС‹Р±СЂР°РЅРЅРѕРіРѕ РєСѓСЂСЃР° (РіСЂР°РЅРёС†С‹ РёР· API).
   * РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РјРѕР¶РµС‚ РёР·РјРµРЅРёС‚СЊ Р·РЅР°С‡РµРЅРёСЏ РІ DateRangePicker РїРѕСЃР»Рµ РїРѕРґСЃС‚Р°РЅРѕРІРєРё.
   */
  applyStatsPeriodFromCourse = (courseId: number): void => {
    const course = this.teacherCourses.find((c) => c.id === courseId);
    const from = course?.dateRangeFromIso?.trim();
    const to = course?.dateRangeToIso?.trim();

    if (!from || !to) {
      return;
    }

    runInAction(() => {
      this.statsPeriodFrom = from;
      this.statsPeriodTo = to;
    });
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
    this.profileFormErrors = {};
    this.profileForm = {
      username: user.username,
      firstName: user.firstName,
      middleName: user.middleName ?? '',
      lastName: user.lastName,
    };
    this.avatarFile = null;
    this.avatarPreview = user.avatar ?? fallbackImage;
    this.syncTeacherProfileFromUser();
  };

  cancelProfileEdit = (): void => {
    this.isEditingProfile = false;
    this.isSavingProfile = false;
    this.profileError = null;
    this.profileFormErrors = {};
    this.avatarFile = null;
    this.avatarPreview = this._rootStore.userStore.user?.avatar ?? fallbackImage;
    this.syncTeacherProfileFromUser();
  };

  updateProfileField = (field: keyof typeof this.profileForm, value: string): void => {
    this.profileForm[field] = value;
    this.clearProfileFormError(field);
  };

  clearProfileFormError = (field: keyof typeof this.profileForm): void => {
    if (!this.profileFormErrors[field as keyof ProfileFormErrors]) {
      return;
    }

    const next = { ...this.profileFormErrors };

    delete next[field as keyof ProfileFormErrors];
    this.profileFormErrors = next;
  };

  setAvatarFile = (file: File | null): void => {
    this.avatarFile = file;
    this.avatarPreview = file ? URL.createObjectURL(file) : fallbackImage;
  };

  setCourseImageFiles = (files: FileList | File[]): void => {
    const nextFiles = Array.from(files);

    if (nextFiles.length === 0) {
      return;
    }

    this.courseImageFileSlots = [...this.courseImageFileSlots, ...nextFiles.map((f) => f)];
    this.courseImagePreviews = [
      ...this.courseImagePreviews,
      ...nextFiles.map((file) => URL.createObjectURL(file)),
    ];
  };

  removeCourseImage = (index: number): void => {
    this.courseImageFileSlots = [
      ...this.courseImageFileSlots.slice(0, index),
      ...this.courseImageFileSlots.slice(index + 1),
    ];
    this.courseImagePreviews = [
      ...this.courseImagePreviews.slice(0, index),
      ...this.courseImagePreviews.slice(index + 1),
    ];
  };

  moveCourseImage = (index: number, delta: number): void => {
    const next = index + delta;

    if (next < 0 || next >= this.courseImagePreviews.length) {
      return;
    }

    const previews = [...this.courseImagePreviews];
    const slots = [...this.courseImageFileSlots];
    const tPrev = previews[index];
    const tSlot = slots[index];

    previews[index] = previews[next]!;
    previews[next] = tPrev!;
    slots[index] = slots[next]!;
    slots[next] = tSlot!;

    this.courseImagePreviews = previews;
    this.courseImageFileSlots = slots;
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
    if (!this._validateProfileForm()) {
      return false;
    }

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
        this.profileError = 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РїСЂРѕС„РёР»СЊ.';
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
          this.profileError = 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РґР°РЅРЅС‹Рµ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЏ.';
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
      this.avatarPreview = normalizedUser?.avatar ?? fallbackImage;
    });

    if (normalizedUser?.role === UserRole.teacher) {
      this.syncTeacherProfileFromUser();
    } else {
      this.applyTeacherProfile(null);
    }

    return true;
  };

  private _validateProfileForm(): boolean {
    const errors: ProfileFormErrors = {};

    if (!this.profileForm.username.trim()) {
      errors.username = 'Р’РІРµРґРёС‚Рµ username';
    }

    if (!this.profileForm.lastName.trim()) {
      errors.lastName = 'Р’РІРµРґРёС‚Рµ С„Р°РјРёР»РёСЋ';
    }

    if (!this.profileForm.firstName.trim()) {
      errors.firstName = 'Р’РІРµРґРёС‚Рµ РёРјСЏ';
    }

    this.profileFormErrors = errors;
    this.profileError = null;

    return Object.keys(errors).length === 0;
  }

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
  // в”Ђв”Ђ Data loading в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

  loadReferenceData = async (): Promise<void> => {
    const [citiesResponse, studiosResponse] = await Promise.all([
      this._requests.cities.call(),
      this._requests.studios.call(),
    ]);

    runInAction(() => {
      if (!citiesResponse.isError) {
        this.cities = citiesResponse.data;
      }

      if (!studiosResponse.isError) {
        this.studios = studiosResponse.data;
      }
    });
  };

  loadEnrollments = async (): Promise<void> => {
    const response = await this._requests.enrollments.call();

    if (response.isError) {
      return;
    }

    runInAction(() => {
      this.enrollments = response.data.map(normalizeCourseDetailToEnrollment);
    });
  };

  loadTeacherCourses = async (teacherId: number): Promise<void> => {
    void teacherId;

    const user = this._rootStore.userStore.user;

    if (!user) {
      return;
    }

    const response = await this._requests.teacherCourses.call();

    if (response.isError) {
      runInAction(() => {
        this.teacherCourses = [];
      });

      return;
    }

    const courses = response.data.map((row) => normalizeMyTeachingCourseToTeacherCourse(row, user));
    let nextSelectedCourseId: number | null = null;

    runInAction(() => {
      this.teacherCourses = courses;

      if (courses.length === 0) {
        this.selectedCourseId = null;
        this.students = [];

        return;
      }

      const hasSelectedCourse =
        this.selectedCourseId !== null &&
        courses.some((course) => course.id === this.selectedCourseId);
      const defaultCourse =
        courses.find((course) => course.courseStatus === 'active') ?? courses[0];

      nextSelectedCourseId = hasSelectedCourse ? this.selectedCourseId : defaultCourse.id;
    });

    if (nextSelectedCourseId !== null) {
      this.setSelectedCourse(nextSelectedCourseId);
    }
  };

  loadLessons = async (courseId: number): Promise<void> => {
    const response = await this._requests.courseLessons.call({
      ...ENDPOINTS.courses.lessons(courseId),
    });

    if (response.isError) {
      return;
    }

    const lessons = response.data.map(normalizeCourseLesson);

    runInAction(() => {
      if (this.selectedCourseId === courseId) {
        this.lessons = lessons;
      }
    });
  };

  loadCourseFormLessons = async (courseId: number): Promise<void> => {
    const response = await this._requests.courseLessons.call({
      ...ENDPOINTS.courses.lessons(courseId),
    });

    if (response.isError) {
      return;
    }

    const items = response.data.map(normalizeCourseLesson);

    runInAction(() => {
      if (this.editingCourseId === courseId && this.isFormOpen) {
        this.courseFormLessons = items;
      }
    });
  };

  loadStudents = async (courseId: number): Promise<void> => {
    const response = await this._requests.courseStudents.call({
      ...ENDPOINTS.courses.students(courseId),
    });

    if (response.isError) {
      return;
    }

    const students = response.data.map(normalizeCourseStudent);

    runInAction(() => {
      if (this.selectedCourseId === courseId) {
        this.students = students;
      }
    });
  };

  loadAttendance = async (courseId: number): Promise<void> => {
    const response = await this._requests.courseAttendance.call({
      ...ENDPOINTS.courses.attendance(courseId),
    });

    if (response.isError) {
      return;
    }

    const records = response.data.map(normalizeCourseAttendance);

    runInAction(() => {
      if (this.selectedCourseId === courseId) {
        this.attendanceData = records;
      }
    });
  };

  loadStats = async (courseId: number): Promise<void> => {
    const params = buildAttendanceStatsQueryParams(this.statsPeriodFrom, this.statsPeriodTo);

    const response = await this._requests.attendanceStats.call({
      ...ENDPOINTS.courses.attendanceStats(courseId),
      params,
    });

    if (response.isError) {
      return;
    }

    const stats = normalizeCourseAttendanceStats(response.data);

    runInAction(() => {
      if (this.selectedCourseId === courseId) {
        this.statsData = stats;
      }
    });
  };

  loadCompareStats = async (courseId: number): Promise<void> => {
    if (!this.comparePeriodFrom || !this.comparePeriodTo) {
      return;
    }

    const params = buildAttendanceStatsQueryParams(this.comparePeriodFrom, this.comparePeriodTo);

    const response = await this._requests.attendanceStats.call({
      ...ENDPOINTS.courses.attendanceStats(courseId),
      params,
    });

    if (response.isError) {
      return;
    }

    const stats = normalizeCourseAttendanceStats(response.data);

    runInAction(() => {
      if (this.selectedCourseId === courseId) {
        this.compareStatsData = stats;
      }
    });
  };

  // в”Ђв”Ђ Teacher actions в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

  createCourse = async (teacherId: number): Promise<void> => {
    void teacherId;

    if (!this._validateCourseForm()) {
      return;
    }

    runInAction(() => {
      this.isLoading = true;
    });

    let payload: FormData | Record<string, unknown>;

    try {
      payload = await this._buildCoursePayload();
    } catch {
      runInAction(() => {
        this.isLoading = false;
      });
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();

      return;
    }

    const response = await this._requests.createCourse.call({
      data: payload,
    });

    if (response.isError) {
      this._applyCourseApiErrors(response.data as CourseApiErrorResponse | undefined);
      runInAction(() => {
        this.isLoading = false;
      });

      return;
    }

    const createdCourse = normalizeApiCourseToTeacherCourse(
      response.data,
      response.data.status,
      this._rootStore.userStore.user as BackendUser | null | undefined
    );

    runInAction(() => {
      this.teacherCourses = [createdCourse, ...this.teacherCourses];
      this.isLoading = false;
      this.isFormOpen = false;
    });

    this.setSelectedCourse(createdCourse.id);
  };

  updateCourse = async (teacherId: number): Promise<void> => {
    void teacherId;

    if (!this.editingCourseId) {
      return;
    }

    if (!this._validateCourseForm()) {
      return;
    }

    runInAction(() => {
      this.isLoading = true;
    });

    let payload: FormData | Record<string, unknown>;

    try {
      payload = await this._buildCoursePayload();
    } catch {
      runInAction(() => {
        this.isLoading = false;
      });
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();

      return;
    }

    const response = await this._requests.updateCourse.call({
      url: ENDPOINTS.courses.update(this.editingCourseId).url,
      data: payload,
    });

    if (response.isError) {
      this._applyCourseApiErrors(response.data as CourseApiErrorResponse | undefined);
      runInAction(() => {
        this.isLoading = false;
      });

      return;
    }

    const updatedCourse = normalizeApiCourseToTeacherCourse(
      response.data,
      response.data.status,
      this._rootStore.userStore.user as BackendUser | null | undefined
    );

    runInAction(() => {
      this.teacherCourses = this.teacherCourses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      );
      this.isLoading = false;
      this.isFormOpen = false;
      this.editingCourseId = null;
      this.courseFormLessons = [];
    });

    this.setSelectedCourse(updatedCourse.id);
  };

  /** Р—Р°РІРµСЂС€Р°РµС‚ РєСѓСЂСЃ РЅР° Р±СЌРєРµ (status completed), Р±РµР· СѓРґР°Р»РµРЅРёСЏ Р·Р°РїРёСЃРё. */
  completeCourse = async (courseId: number, teacherId: number): Promise<void> => {
    void teacherId;

    runInAction(() => {
      this.isLoading = true;
    });

    const response = await this._requests.updateCourse.call({
      url: ENDPOINTS.courses.update(courseId).url,
      data: { status: 'completed' },
    });

    if (response.isError) {
      runInAction(() => {
        this.isLoading = false;
      });

      return;
    }

    const updatedCourse = normalizeApiCourseToTeacherCourse(
      response.data,
      response.data.status,
      this._rootStore.userStore.user as BackendUser | null | undefined
    );

    runInAction(() => {
      this.teacherCourses = this.teacherCourses.map((course) =>
        course.id === courseId ? updatedCourse : course
      );

      if (this.selectedCourseId === courseId) {
        this.selectedCourseId = null;
        this.lessons = [];
        this.students = [];
        this.attendanceData = [];
        this.statsData = null;
        this.compareStatsData = null;
      }

      if (this.editingCourseId === courseId) {
        this.closeForm();
      }

      this.isLoading = false;
    });

    void this.loadTeacherCourses(teacherId);
    void this._rootStore.coursesStore.loadCourses();
  };

  cancelLesson = async (lessonId: number): Promise<void> => {
    const lesson =
      this.courseFormLessons.find((l) => l.id === lessonId) ??
      this.lessons.find((l) => l.id === lessonId);

    if (!lesson) {
      return;
    }

    const courseId = lesson.courseId;

    const response = await this._requests.cancelLessonRequest.call({
      ...ENDPOINTS.lessons.cancel(lessonId),
    });

    if (response.isError) {
      return;
    }

    runInAction(() => {
      this.courseFormLessons = this.courseFormLessons.map((item) =>
        item.id === lessonId ? { ...item, status: 'cancelled' } : item
      );
      this.lessons = this.lessons.map((item) =>
        item.id === lessonId ? { ...item, status: 'cancelled' } : item
      );
    });

    await this._refreshDataAfterLessonCancelled(courseId);
  };

  private async _refreshDataAfterLessonCancelled(courseId: number): Promise<void> {
    const tasks: Promise<void>[] = [];

    if (this.editingCourseId === courseId && this.isFormOpen) {
      tasks.push(this.loadCourseFormLessons(courseId));
    }

    if (this.selectedCourseId === courseId) {
      tasks.push(
        this.loadLessons(courseId),
        this.loadAttendance(courseId),
        this.loadStats(courseId),
        this.loadCompareStats(courseId)
      );
    }

    await Promise.all(tasks);
  }

  markAttendance = async (lessonId: number, studentId: number, present: boolean): Promise<void> => {
    const payload: MarkAttendancePayloadServer = {
      student_id: studentId,
      status: present ? 'present' : 'absent',
    };

    const response = await this._requests.markAttendance.call({
      ...ENDPOINTS.lessons.markAttendance(lessonId),
      data: payload,
    });

    if (response.isError) {
      return;
    }

    if (this.selectedCourseId) {
      void this.loadAttendance(this.selectedCourseId);
    }
  };

  exportStatsCsv = async (courseId: number): Promise<void> => {
    const params = buildAttendanceStatsQueryParams(this.statsPeriodFrom, this.statsPeriodTo);

    const response = await this._requests.attendanceStats.call({
      ...ENDPOINTS.courses.attendanceStats(courseId),
      params,
    });

    if (response.isError) {
      return;
    }

    const stats = normalizeCourseAttendanceStats(response.data);
    const csvText = buildAttendanceStatsCsvContent(stats);
    const course = this.teacherCourses.find((c) => c.id === courseId);
    const displayName = course?.name ?? `РљСѓСЂСЃ_${courseId}`;
    const fileName = buildAttendanceStatsExportFileName(
      displayName,
      this.statsPeriodFrom,
      this.statsPeriodTo,
      courseId
    );
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Р”Р»СЏ multipart: Р±СЌРєРµРЅРґ РїСЂРё replace_existing СѓРґР°Р»СЏРµС‚ РІСЃСЋ РіР°Р»РµСЂРµСЋ Рё СЃРѕР·РґР°С‘С‚ С‚РѕР»СЊРєРѕ РёР· image_files.
   * РџРѕСЌС‚РѕРјСѓ РІ Р·Р°РїСЂРѕСЃ РґРѕР»Р¶РЅС‹ РїРѕРїР°СЃС‚СЊ РІСЃРµ РєР°СЂС‚РёРЅРєРё РїРѕ РїРѕСЂСЏРґРєСѓ: РЅРѕРІС‹Рµ File Рё СѓР¶Рµ СЃРѕС…СЂР°РЅС‘РЅРЅС‹Рµ (fetch РїРѕ URL РїСЂРµРІСЊСЋ).
   */
  private async _previewToFileForMultipart(preview: string, index: number): Promise<File> {
    if (preview.startsWith('blob:')) {
      const res = await fetch(preview);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';

      return new File([blob], `new-${index}.${ext}`, { type: blob.type || 'image/jpeg' });
    }

    const fetchUrl = resolveCourseImageFetchUrl(preview);
    const res = await fetch(fetchUrl, { credentials: 'include', mode: 'cors' });

    if (!res.ok) {
      throw new Error(`РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕРґРіСЂСѓР·РёС‚СЊ С„РѕС‚Рѕ ${index + 1} РґР»СЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ`);
    }

    const blob = await res.blob();
    const ext = blob.type.includes('png') ? 'png' : 'jpg';

    return new File([blob], `existing-${index}.${ext}`, { type: blob.type || 'image/jpeg' });
  }

  private async _resolveAllCourseImagesAsFiles(): Promise<File[]> {
    const n = this.courseImagePreviews.length;
    const out: File[] = [];

    for (let i = 0; i < n; i++) {
      const slot = this.courseImageFileSlots[i];
      const preview = this.courseImagePreviews[i];

      if (slot) {
        out.push(slot);
        continue;
      }

      if (!preview) {
        continue;
      }

      out.push(await this._previewToFileForMultipart(preview, i));
    }

    return out;
  }

  private _buildExpandedScheduleEntries(): Array<{
    weekday: string;
    time_from: string;
    time_to: string;
    location_text: string;
  }> {
    return this.courseFormData.schedule.flatMap((entry) =>
      entry.weekday
        .split(',')
        .map((weekday) => weekday.trim())
        .filter(Boolean)
        .map((weekday) => ({
          weekday: WEEKDAY_TO_API[weekday] ?? 'mon',
          time_from: entry.timeFrom,
          time_to: entry.timeTo,
          location_text: this.courseFormData.useSameLocation
            ? this.courseFormData.sharedLocation.trim()
            : entry.location?.trim() ?? '',
        }))
    );
  }

  private _dedupeScheduleEntries(
    schedule: Array<{
      weekday: string;
      time_from: string;
      time_to: string;
      location_text: string;
    }>
  ): Array<{
    weekday: string;
    time_from: string;
    time_to: string;
    location_text: string;
  }> {
    const unique = new Map<
      string,
      {
        weekday: string;
        time_from: string;
        time_to: string;
        location_text: string;
      }
    >();

    schedule.forEach((entry) => {
      const key = `${entry.weekday}|${entry.time_from}|${entry.time_to}`;

      if (!unique.has(key)) {
        unique.set(key, entry);
      }
    });

    return [...unique.values()];
  }

  private async _buildCoursePayload(): Promise<FormData | Record<string, unknown>> {
    const danceStyle = this._rootStore.danceStylesStore.styles.find(
      (item) => item.name === this.courseFormData.type
    );
    const studio = this.studios.find((item) => item.name === this.courseFormData.studio);

    if (!danceStyle) {
      throw new Error('Dance style not found');
    }

    const schedule = this._dedupeScheduleEntries(this._buildExpandedScheduleEntries());

    const hasNewUploads = this.courseImageFileSlots.some((slot) => slot !== null);

    if (hasNewUploads) {
      const payload = new FormData();

      payload.append('dance_style_id', String(danceStyle.id));

      if (studio?.id) {
        payload.append('studio_id', String(studio.id));
      }

      payload.append('name', this.courseFormData.name.trim());
      payload.append('description', this.courseFormData.description.trim());
      payload.append('music_url', this.courseFormData.musicUrl.trim());
      payload.append('level', LEVEL_TO_API[this.courseFormData.level] ?? 'beginner');
      payload.append('price', String(Number(this.courseFormData.price)));
      payload.append('capacity', String(Number(this.courseFormData.capacity)));
      payload.append(
        'date_from',
        ddmmToIso(this.courseFormData.dateFrom, PROFILE_PAGE_REFERENCE_YEAR)
      );
      payload.append('date_to', ddmmToIso(this.courseFormData.dateTo, PROFILE_PAGE_REFERENCE_YEAR));
      payload.append('status', 'published');
      payload.append('schedule', JSON.stringify(schedule));

      const imageFiles = await this._resolveAllCourseImagesAsFiles();

      imageFiles.forEach((file) => {
        payload.append('image_files', file);
      });

      return payload;
    }

    const jsonPayload: Record<string, unknown> = {
      dance_style_id: danceStyle.id,
      studio_id: studio?.id ?? null,
      name: this.courseFormData.name.trim(),
      description: this.courseFormData.description.trim(),
      music_url: this.courseFormData.musicUrl.trim(),
      level: LEVEL_TO_API[this.courseFormData.level] ?? 'beginner',
      price: Number(this.courseFormData.price),
      capacity: Number(this.courseFormData.capacity),
      date_from: ddmmToIso(this.courseFormData.dateFrom, PROFILE_PAGE_REFERENCE_YEAR),
      date_to: ddmmToIso(this.courseFormData.dateTo, PROFILE_PAGE_REFERENCE_YEAR),
      status: 'published',
      schedule,
    };

    if (this.courseImagePreviews.length > 0) {
      jsonPayload.image_cover = this.courseImagePreviews[0];
      jsonPayload.ordered_image_urls = [...this.courseImagePreviews];
    } else {
      jsonPayload.image_cover = '';
    }

    return jsonPayload;
  }

  private _validateCourseForm(): boolean {
    const errors: CourseFormErrors = {};
    const form = this.courseFormData;
    const trimmedName = form.name.trim();
    const trimmedType = form.type.trim();
    const trimmedStudio = form.studio.trim();
    const trimmedCity = form.city.trim();
    const priceNumber = Number(form.price);

    if (!trimmedName) {
      errors.name = 'Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ РєСѓСЂСЃР°';
    }

    if (!trimmedType) {
      errors.type = 'Р’С‹Р±РµСЂРёС‚Рµ СЃС‚РёР»СЊ С‚Р°РЅС†Р°';
    }

    if (!form.level.trim()) {
      errors.level = 'Р’С‹Р±РµСЂРёС‚Рµ СѓСЂРѕРІРµРЅСЊ';
    }

    if (!isValidDDMM(form.dateFrom)) {
      errors.dateFrom = 'РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ РЅР°С‡Р°Р»Р° РІ С„РѕСЂРјР°С‚Рµ Р”Р”.РњРњ';
    }

    if (!isValidDDMM(form.dateTo)) {
      errors.dateTo = 'РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ РѕРєРѕРЅС‡Р°РЅРёСЏ РІ С„РѕСЂРјР°С‚Рµ Р”Р”.РњРњ';
    }

    if (!errors.dateFrom && !errors.dateTo) {
      const dateFrom = fromIsoDate(ddmmToIso(form.dateFrom, PROFILE_PAGE_REFERENCE_YEAR));
      const dateTo = fromIsoDate(ddmmToIso(form.dateTo, PROFILE_PAGE_REFERENCE_YEAR));

      if (dateFrom && dateTo && dateTo < dateFrom) {
        errors.dateTo = 'Р”Р°С‚Р° РѕРєРѕРЅС‡Р°РЅРёСЏ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ СЂР°РЅСЊС€Рµ РґР°С‚С‹ РЅР°С‡Р°Р»Р°';
      }
    }

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      errors.price = 'Р¦РµРЅР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 0';
    }

    if (!trimmedStudio) {
      errors.studio = 'Р’С‹Р±РµСЂРёС‚Рµ СЃС‚СѓРґРёСЋ';
    }

    if (!trimmedCity) {
      errors.city = 'Р’С‹Р±РµСЂРёС‚Рµ РіРѕСЂРѕРґ';
    }

    const capacityNumber = Number(form.capacity);

    if (!Number.isFinite(capacityNumber) || capacityNumber <= 0) {
      errors.capacity = 'РљРѕР»РёС‡РµСЃС‚РІРѕ РјРµСЃС‚ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 0';
    }

    if (form.schedule.length === 0) {
      errors.schedule = 'Р”РѕР±Р°РІСЊС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРЅРѕ Р·Р°РЅСЏС‚РёРµ РІ СЂР°СЃРїРёСЃР°РЅРёРµ';
    }

    if (form.useSameLocation) {
      if (!form.sharedLocation.trim()) {
        errors.sharedLocation = 'Р’РІРµРґРёС‚Рµ Р°РґСЂРµСЃ Р·Р°РЅСЏС‚РёР№';
      }
    }

    form.schedule.forEach((entry, index) => {
      if (!entry.weekday.trim()) {
        errors[`schedule.${index}.weekday`] = 'Р’С‹Р±РµСЂРёС‚Рµ РґРµРЅСЊ РЅРµРґРµР»Рё';
      }

      if (!TIME_HHMM_REGEX.test(entry.timeFrom.trim())) {
        errors[`schedule.${index}.timeFrom`] = 'Р’РІРµРґРёС‚Рµ РІСЂРµРјСЏ РІ С„РѕСЂРјР°С‚Рµ Р§Р§:РњРњ';
      }

      if (!TIME_HHMM_REGEX.test(entry.timeTo.trim())) {
        errors[`schedule.${index}.timeTo`] = 'Р’РІРµРґРёС‚Рµ РІСЂРµРјСЏ РІ С„РѕСЂРјР°С‚Рµ Р§Р§:РњРњ';
      }

      if (
        TIME_HHMM_REGEX.test(entry.timeFrom.trim()) &&
        TIME_HHMM_REGEX.test(entry.timeTo.trim()) &&
        toComparableTime(entry.timeTo.trim()) <= toComparableTime(entry.timeFrom.trim())
      ) {
        errors[`schedule.${index}.timeTo`] = 'Р’СЂРµРјСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ РїРѕР·Р¶Рµ РІСЂРµРјРµРЅРё РЅР°С‡Р°Р»Р°';
      }

      if (!form.useSameLocation && !(entry.location ?? '').trim()) {
        errors[`schedule.${index}.location`] = 'Р’РІРµРґРёС‚Рµ Р°РґСЂРµСЃ Р·Р°РЅСЏС‚РёСЏ';
      }
    });

    this.courseFormErrors = errors;

    return Object.keys(errors).length === 0;
  }

  private _extractFirstErrorMessage(value: unknown): string | null {
    if (typeof value === 'string') {
      const trimmed = value.trim().replace(/[.]+$/, '');

      return trimmed || null;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const message = this._extractFirstErrorMessage(item);

        if (message) {
          return message;
        }
      }
    }

    if (value && typeof value === 'object') {
      for (const nested of Object.values(value as Record<string, unknown>)) {
        const message = this._extractFirstErrorMessage(nested);

        if (message) {
          return message;
        }
      }
    }

    return null;
  }

  private _applyCourseApiErrors(errorData?: CourseApiErrorResponse): void {
    if (!errorData || typeof errorData !== 'object') {
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();

      return;
    }

    const fieldMap: Record<string, string> = {
      music_url: 'musicUrl',
      name: 'name',
      dance_style_id: 'type',
      level: 'level',
      date_from: 'dateFrom',
      date_to: 'dateTo',
      price: 'price',
      studio_id: 'studio',
      city: 'city',
      capacity: 'capacity',
      schedule: 'schedule',
    };
    const mappedErrors: CourseFormErrors = {};

    for (const [serverField, formField] of Object.entries(fieldMap)) {
      const message = this._extractFirstErrorMessage(errorData[serverField]);

      if (message) {
        mappedErrors[formField] = message;
      }
    }

    if (Object.keys(mappedErrors).length > 0) {
      runInAction(() => {
        this.courseFormErrors = {
          ...this.courseFormErrors,
          ...mappedErrors,
        };
      });

      return;
    }

    this._rootStore.snackbarStore.triggerDefaultErrorMessage();
  }

  destroy = (): void => {};
}
