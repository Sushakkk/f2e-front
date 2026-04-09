import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
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
import { resolveCourseImageFetchUrl } from 'utils/courseImageFetchUrl';
import { ddmmToIso, fromIsoDate, toDDMM } from 'utils/dateUtils';

export type ProfileSection =
  | 'profile'
  | 'enrollments'
  | 'favorites'
  | 'teacherCourses'
  | 'students'
  | 'stats';

export type ViewMode = 'student' | 'teacher';

const MOCK_TEACHER_ID = 11;
const REFERENCE_YEAR = new Date().getFullYear();

const LEVEL_TO_API: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'any'> = {
  Начинающие: 'beginner',
  'Средний уровень': 'intermediate',
  Продвинутые: 'advanced',
  'Любой уровень': 'any',
};

const LEVEL_FROM_API = {
  beginner: 'Начинающие',
  intermediate: 'Средний уровень',
  advanced: 'Продвинутые',
  any: 'Любой уровень',
} as const;

const WEEKDAY_TO_API: Record<string, 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'> = {
  Пн: 'mon',
  Вт: 'tue',
  Ср: 'wed',
  Чт: 'thu',
  Пт: 'fri',
  Сб: 'sat',
  Вс: 'sun',
};

type BackendCity = {
  id: number;
  name: string;
};

type BackendStudio = {
  id: number;
  name: string;
  city: string;
  address: string;
  metro: string;
};

type BackendCourseSummary = {
  id: number;
  name: string;
  status: string;
  level: string;
  price: number | string;
  date_from: string;
  date_to: string;
  image: string;
  teacher_id: number;
  teacher_name: string;
  dance_style: string;
  city: string;
  studio: string;
  schedule: Array<{
    weekday: string;
    time_from: string;
    time_to: string;
    location?: string | null;
  }>;
};

type BackendTeachingCourse = {
  id: number;
  status: string;
};

type BackendCourseDetail = {
  id: number;
  name: string;
  description: string;
  status: string;
  level: string;
  price: number | string;
  capacity: number;
  spots_left: number;
  date_from: string;
  date_to: string;
  images: string[];
  teacher_id: number;
  teacher_name: string;
  dance_style: string;
  city: string;
  studio: string;
  schedule: Array<{
    weekday: string;
    time_from: string;
    time_to: string;
    location?: string | null;
  }>;
  music: {
    artist: string;
    track: string;
    url: string;
  };
};

const EMPTY_FORM: CourseFormData = {
  name: '',
  type: '',
  level: 'Начинающие',
  dateFrom: '',
  dateTo: '',
  price: '',
  studio: '',
  city: '',
  description: '',
  musicUrl: '',
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

const formatDateForUi = (iso: string): string => {
  const date = fromIsoDate(iso);

  return date ? toDDMM(date) : '';
};

const getLevelFromApi = (value: string): CourseFormData['level'] => {
  if (value in LEVEL_FROM_API) {
    return LEVEL_FROM_API[value as keyof typeof LEVEL_FROM_API];
  }

  return 'Начинающие';
};

const normalizeCourseStatus = (status: string): TeacherCourse['courseStatus'] => {
  switch (status) {
    case 'cancelled':
      return 'cancelled';
    case 'completed':
      return 'completed';
    default:
      return 'active';
  }
};

const buildTeacherCourse = (
  course: BackendCourseSummary | BackendCourseDetail,
  status: string,
  currentUser:
    | {
        teacher?: {
          bio: string;
          images: string[];
          achievements: string[];
          experience: number;
          specializations: string[];
          rating: number;
        } | null;
      }
    | null
    | undefined
): TeacherCourse => ({
  id: course.id,
  name: course.name,
  type: course.dance_style,
  teacher: {
    id: course.teacher_id,
    name: course.teacher_name,
    bio: currentUser?.teacher?.bio ?? '',
    images: currentUser?.teacher?.images ?? [],
    achievements: currentUser?.teacher?.achievements ?? [],
    experience: currentUser?.teacher?.experience ?? 0,
    specializations: currentUser?.teacher?.specializations ?? [],
    rating: currentUser?.teacher?.rating ?? 0,
    reviews: [],
  },
  level: getLevelFromApi(course.level) as TeacherCourse['level'],
  dateFrom: formatDateForUi(course.date_from),
  dateTo: formatDateForUi(course.date_to),
  price: Number(course.price),
  images:
    'images' in course
      ? course.images.length > 0
        ? course.images
        : [fallbackImage]
      : course.image
        ? [course.image]
        : [fallbackImage],
  studio: course.studio ?? '',
  schedule: course.schedule?.map((entry) => ({
    weekday: entry.weekday,
    timeFrom: entry.time_from,
    timeTo: entry.time_to,
    location: entry.location ?? undefined,
  })),
  city: course.city ?? '',
  description: 'description' in course ? course.description : '',
  capacity: 'capacity' in course ? course.capacity : 0,
  spotsLeft: 'spots_left' in course ? course.spots_left : 0,
  music:
    'music' in course
      ? course.music
      : {
          artist: '',
          track: '',
          url: '',
        },
  createdByTeacherId: course.teacher_id,
  courseStatus: normalizeCourseStatus(status),
});

export class ProfilePageStore implements ILocalStore {
  private readonly _rootStore: IRootStore;
  private readonly _requests: {
    updateUser: IApiRequest<BackendUser, ErrorResponse>;
    updateTeacherProfile: IApiRequest<BackendTeacherProfile, ErrorResponse>;
    cities: IApiRequest<BackendCity[], ErrorResponse>;
    studios: IApiRequest<BackendStudio[], ErrorResponse>;
    teacherCourses: IApiRequest<BackendTeachingCourse[], ErrorResponse>;
    courseSummaries: IApiRequest<BackendCourseSummary[], ErrorResponse>;
    courseDetail: IApiRequest<BackendCourseDetail, ErrorResponse>;
    createCourse: IApiRequest<BackendCourseDetail, ErrorResponse>;
    updateCourse: IApiRequest<BackendCourseDetail, ErrorResponse>;
  };

  activeSection: ProfileSection = 'profile';
  viewMode: ViewMode = 'student';

  teacherCourses: TeacherCourse[] = [];
  cities: BackendCity[] = [];
  studios: BackendStudio[] = [];
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

  /** Параллельно courseImagePreviews: null = уже сохранённое фото (URL), File = новая загрузка */
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
      courseSummaries: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.list,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      courseDetail: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.courses.detail(0),
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
    };

    makeObservable(this, {
      activeSection: observable,
      viewMode: observable,
      teacherCourses: observable.ref,
      cities: observable.ref,
      studios: observable.ref,
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
      setCourseImageFiles: action,
      removeCourseImage: action,
      moveCourseImage: action,
      updateTeacherField: action,
      removeTeacherImage: action,
      saveProfile: action,
    });

    if (this.viewMode === 'teacher') {
      void this.loadTeacherCourses(MOCK_TEACHER_ID);
      void this.loadReferenceData();
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
      void this.loadTeacherCourses(MOCK_TEACHER_ID);
      void this.loadReferenceData();
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
    this.courseImageFileSlots = [];
    this.courseImagePreviews = [];
    this.courseFormData = {
      ...EMPTY_FORM,
      schedule: [{ weekday: 'Пн', timeFrom: '18:00', timeTo: '19:30' }],
    };
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
      this.editingCourseId = courseId;
      this.courseImageFileSlots = response.data.images.map(() => null);
      this.courseImagePreviews = response.data.images;
      this.courseFormData = {
        name: response.data.name,
        type: response.data.dance_style,
        level: getLevelFromApi(response.data.level),
        dateFrom: formatDateForUi(response.data.date_from),
        dateTo: formatDateForUi(response.data.date_to),
        price: String(response.data.price),
        studio: response.data.studio,
        city: response.data.city,
        description: response.data.description,
        musicUrl: response.data.music.url,
        capacity: response.data.capacity,
        schedule:
          response.data.schedule.length > 0
            ? response.data.schedule.map((entry) => ({
                weekday: entry.weekday,
                timeFrom: entry.time_from,
                timeTo: entry.time_to,
                location: entry.location ?? undefined,
              }))
            : [{ weekday: 'Пн', timeFrom: '18:00', timeTo: '19:30' }],
      };
      this.isFormOpen = true;
      this.isLoading = false;
    });
  };

  closeForm = (): void => {
    this.isFormOpen = false;
    this.editingCourseId = null;
    this.courseImageFileSlots = [];
    this.courseImagePreviews = [];
  };

  updateFormField = <K extends keyof CourseFormData>(field: K, value: CourseFormData[K]): void => {
    this.courseFormData[field] = value;

    if (field === 'studio') {
      const studio = this.studios.find((item) => item.name === value);

      if (studio) {
        this.courseFormData.city = studio.city;
      }
    }
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
    this.avatarPreview = user.avatar ?? fallbackImage;
    this.syncTeacherProfileFromUser();
  };

  cancelProfileEdit = (): void => {
    this.isEditingProfile = false;
    this.isSavingProfile = false;
    this.profileError = null;
    this.avatarFile = null;
    this.avatarPreview = this._rootStore.userStore.user?.avatar ?? fallbackImage;
    this.syncTeacherProfileFromUser();
  };

  updateProfileField = (field: keyof typeof this.profileForm, value: string): void => {
    this.profileForm[field] = value;
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
      this.avatarPreview = normalizedUser?.avatar ?? fallbackImage;
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

  loadTeacherCourses = async (_teacherId: number): Promise<void> => {
    const user = this._rootStore.userStore.user;

    if (!user?.email) {
      return;
    }

    const [statusResponse, summaryResponse] = await Promise.all([
      this._requests.teacherCourses.call(),
      this._requests.courseSummaries.call({
        params: {
          teacher: user.email,
        },
      }),
    ]);

    if (statusResponse.isError || summaryResponse.isError) {
      runInAction(() => {
        this.teacherCourses = MockDb.getTeacherCourses(MOCK_TEACHER_ID);
      });
      return;
    }

    const statusMap = new Map(statusResponse.data.map((course) => [course.id, course.status]));
    const courses = summaryResponse.data.map((course) =>
      buildTeacherCourse(course, statusMap.get(course.id) ?? course.status ?? 'published', user)
    );

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

  createCourse = async (_teacherId: number): Promise<void> => {
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
      runInAction(() => {
        this.isLoading = false;
      });
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();

      return;
    }

    runInAction(() => {
      const createdCourse = buildTeacherCourse(
        response.data,
        response.data.status,
        this._rootStore.userStore.user as BackendUser | null | undefined
      );

      this.teacherCourses = [createdCourse, ...this.teacherCourses];
      this.isLoading = false;
      this.isFormOpen = false;
      this.selectedCourseId = createdCourse.id;
    });
  };

  updateCourse = async (_teacherId: number): Promise<void> => {
    if (!this.editingCourseId) {
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
      runInAction(() => {
        this.isLoading = false;
      });
      this._rootStore.snackbarStore.triggerDefaultErrorMessage();

      return;
    }

    runInAction(() => {
      const updatedCourse = buildTeacherCourse(
        response.data,
        response.data.status,
        this._rootStore.userStore.user as BackendUser | null | undefined
      );

      this.teacherCourses = this.teacherCourses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      );
      this.isLoading = false;
      this.isFormOpen = false;
      this.editingCourseId = null;
      this.selectedCourseId = updatedCourse.id;
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

  /**
   * Для multipart: бэкенд при replace_existing удаляет всю галерею и создаёт только из image_files.
   * Поэтому в запрос должны попасть все картинки по порядку: новые File и уже сохранённые (fetch по URL превью).
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
      throw new Error(`Не удалось подгрузить фото ${index + 1} для сохранения`);
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

  private async _buildCoursePayload(): Promise<FormData | Record<string, unknown>> {
    const danceStyle = this._rootStore.danceStylesStore.styles.find(
      (item) => item.name === this.courseFormData.type
    );
    const studio = this.studios.find((item) => item.name === this.courseFormData.studio);

    if (!danceStyle) {
      throw new Error('Dance style not found');
    }

    const schedule = this.courseFormData.schedule.flatMap((entry) =>
      entry.weekday
        .split(',')
        .map((weekday) => weekday.trim())
        .filter(Boolean)
        .map((weekday) => ({
          weekday: WEEKDAY_TO_API[weekday] ?? 'mon',
          time_from: entry.timeFrom,
          time_to: entry.timeTo,
          location_text: entry.location?.trim() ?? '',
        }))
    );

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
      payload.append('capacity', String(this.courseFormData.capacity));
      payload.append('date_from', ddmmToIso(this.courseFormData.dateFrom, REFERENCE_YEAR));
      payload.append('date_to', ddmmToIso(this.courseFormData.dateTo, REFERENCE_YEAR));
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
      capacity: this.courseFormData.capacity,
      date_from: ddmmToIso(this.courseFormData.dateFrom, REFERENCE_YEAR),
      date_to: ddmmToIso(this.courseFormData.dateTo, REFERENCE_YEAR),
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

  destroy = (): void => {};
}
