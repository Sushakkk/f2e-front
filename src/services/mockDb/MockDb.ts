import {
  COURSES_CONFIG,
  type CourseConfigItem,
  type ScheduleEntry,
  type Teacher,
} from 'config/cards';
import type {
  AttendanceRecord,
  AttendanceStats,
  CourseFormData,
  Lesson,
  TeacherCourse,
} from 'config/teacher';
import type { Enrollment, UserConfig } from 'config/users';
import { USERS_CONFIG } from 'config/users';

import type {
  CourseSpotsMap,
  FavoritesData,
  FavoritesMap,
  MockAuthResult,
  MockSession,
  MockUserData,
  RegisterData,
} from './types';

const STORAGE_KEYS = {
  users: 'mockDb_users',
  favorites: 'mockDb_favorites',
  session: 'mockDb_session',
  spots: 'mockDb_spots',
  teacherCourses: 'mockDb_teacherCourses',
  teacherProfiles: 'mockDb_teacherProfiles',
  lessons: 'mockDb_lessons',
  attendance: 'mockDb_attendance',
  initialized: 'mockDb_initialized',
} as const;

const WEEKDAY_MAP: Record<string, number> = {
  Пн: 1,
  Вт: 2,
  Ср: 3,
  Чт: 4,
  Пт: 5,
  Сб: 6,
  Вс: 0,
};

function parseDDMM(ddmm: string, year = 2025): Date {
  const [dd, mm] = ddmm.split('.').map(Number);

  return new Date(year, mm - 1, dd);
}

function generateLessonsFromSchedule(
  courseId: number,
  schedule: ScheduleEntry[],
  dateFrom: string,
  dateTo: string
): Lesson[] {
  const start = parseDDMM(dateFrom);
  const end = parseDDMM(dateTo);
  const lessons: Lesson[] = [];
  let lessonId = courseId * 1000;

  for (const entry of schedule) {
    const weekdayNames = entry.weekday.split(',').map((w) => w.trim());

    for (const wdName of weekdayNames) {
      const targetDay = WEEKDAY_MAP[wdName];

      if (targetDay === undefined) {
        continue;
      }

      const current = new Date(start);

      while (current.getDay() !== targetDay) {
        current.setDate(current.getDate() + 1);
      }

      while (current <= end) {
        lessonId++;
        lessons.push({
          id: lessonId,
          courseId,
          date: current.toISOString().split('T')[0],
          timeFrom: entry.timeFrom,
          timeTo: entry.timeTo,
          location: entry.location,
          status: 'scheduled',
        });
        current.setDate(current.getDate() + 7);
      }
    }
  }

  lessons.sort((a, b) => a.date.localeCompare(b.date));

  return lessons;
}

function buildScheduleFromCourse(course: CourseConfigItem): ScheduleEntry[] {
  return course.schedule ?? [];
}

const DB_VERSION = '3';

const DELAY_MS = 300;

function delay(ms = DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateToken(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function stripPassword(user: UserConfig): Omit<UserConfig, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  const { password: _, ...rest } = user;

  return rest;
}

class MockDb {
  private static _getTeacherProfiles(): Record<string, Omit<Teacher, 'reviews'>> {
    const raw = localStorage.getItem(STORAGE_KEYS.teacherProfiles);

    return raw ? (JSON.parse(raw) as Record<string, Omit<Teacher, 'reviews'>>) : {};
  }

  private static _setTeacherProfiles(profiles: Record<string, Omit<Teacher, 'reviews'>>): void {
    localStorage.setItem(STORAGE_KEYS.teacherProfiles, JSON.stringify(profiles));
  }

  static init(): void {
    if (localStorage.getItem(STORAGE_KEYS.initialized) === DB_VERSION) {
      return;
    }

    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));

    const users = JSON.parse(JSON.stringify(USERS_CONFIG)) as UserConfig[];

    const spots: CourseSpotsMap = {};

    for (const c of COURSES_CONFIG) {
      spots[c.id] = c.spotsLeft;
    }

    const teacherCourses: TeacherCourse[] = [];
    const allLessons: Lesson[] = [];
    const allAttendance: AttendanceRecord[] = [];

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const teacherMapping = new Map<string, number>([
      ['Карпова Ксения', 11],
      ['Кузнецов Артём', 12],
    ]);

    for (const course of COURSES_CONFIG) {
      const teacherId = teacherMapping.get(course.teacher.name);

      if (!teacherId) {
        continue;
      }

      teacherCourses.push({
        ...course,
        createdByTeacherId: teacherId,
        courseStatus: 'active',
      });

      const schedule = buildScheduleFromCourse(course);
      const lessons = generateLessonsFromSchedule(
        course.id,
        schedule,
        course.dateFrom,
        course.dateTo
      );

      allLessons.push(...lessons);

      const enrolledStudents = users
        .filter((u) => u.enrollments.some((e) => e.courseId === course.id && e.status === 'active'))
        .map((u) => u.id);

      for (const lesson of lessons) {
        for (const studentId of enrolledStudents) {
          const present = Math.random() > 0.2;

          allAttendance.push({
            lessonId: lesson.id,
            courseId: course.id,
            studentId,
            present,
            markedAt: lesson.date,
          });
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.spots, JSON.stringify(spots));
    localStorage.setItem(STORAGE_KEYS.teacherCourses, JSON.stringify(teacherCourses));
    localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(allLessons));
    localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(allAttendance));
    localStorage.setItem(STORAGE_KEYS.initialized, DB_VERSION);
  }

  static reset(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    MockDb.init();
  }

  // ── Private storage helpers ──────────────────────────────────────────

  private static _getUsers(): UserConfig[] {
    const raw = localStorage.getItem(STORAGE_KEYS.users);

    return raw ? (JSON.parse(raw) as UserConfig[]) : [];
  }

  private static _setUsers(users: UserConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  private static _getFavorites(): FavoritesMap {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);

    return raw ? (JSON.parse(raw) as FavoritesMap) : {};
  }

  private static _setFavorites(favorites: FavoritesMap): void {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }

  private static _getSession(): MockSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.session);

    return raw ? (JSON.parse(raw) as MockSession) : null;
  }

  private static _setSession(session: MockSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
  }

  private static _getSpots(): CourseSpotsMap {
    const raw = localStorage.getItem(STORAGE_KEYS.spots);

    return raw ? (JSON.parse(raw) as CourseSpotsMap) : {};
  }

  private static _setSpots(spots: CourseSpotsMap): void {
    localStorage.setItem(STORAGE_KEYS.spots, JSON.stringify(spots));
  }

  private static _getUserFavorites(userId: number): FavoritesData {
    const favorites = MockDb._getFavorites();

    return favorites[userId] || { courseIds: [], teacherNames: [] };
  }

  private static _buildUserData(user: UserConfig): MockUserData {
    const favorites = MockDb._getUserFavorites(user.id);

    return {
      ...stripPassword(user),
      favoriteCourseIds: favorites.courseIds,
      favoriteTeacherNames: favorites.teacherNames,
    };
  }

  // ── Auth ──────────────────────────────────────────────────────────────

  static async login(email: string, password: string): Promise<MockAuthResult> {
    await delay();

    const users = MockDb._getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: 'Неверный email или пароль' };
    }

    const token = generateToken();

    MockDb._setSession({ userId: user.id, token });

    return { success: true, user: MockDb._buildUserData(user), token };
  }

  static async register(data: RegisterData): Promise<MockAuthResult> {
    await delay();

    const users = MockDb._getUsers();

    if (users.find((u) => u.email === data.email)) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }

    const newUser: UserConfig = {
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? '',
      password: data.password,
      city: data.city ?? '',
      level: data.level ?? 'Beginner',
      role: data.role ?? 'student',
      registeredAt: new Date().toISOString().split('T')[0],
      enrollments: [],
    };

    users.push(newUser);
    MockDb._setUsers(users);

    const token = generateToken();

    MockDb._setSession({ userId: newUser.id, token });

    return { success: true, user: MockDb._buildUserData(newUser), token };
  }

  static logout(): void {
    MockDb._setSession(null);
  }

  static getSession(): MockSession | null {
    return MockDb._getSession();
  }

  static getCurrentUser(): MockUserData | null {
    const session = MockDb._getSession();

    if (!session) {
      return null;
    }

    const users = MockDb._getUsers();
    const user = users.find((u) => u.id === session.userId);

    if (!user) {
      return null;
    }

    return MockDb._buildUserData(user);
  }

  // ── Enrollments ───────────────────────────────────────────────────────

  static async enrollInCourse(courseId: number): Promise<Enrollment | null> {
    await delay();

    const session = MockDb._getSession();

    if (!session) {
      return null;
    }

    const users = MockDb._getUsers();
    const userIdx = users.findIndex((u) => u.id === session.userId);

    if (userIdx === -1) {
      return null;
    }

    const user = users[userIdx];
    const existing = user.enrollments.find(
      (e) => e.courseId === courseId && e.status !== 'cancelled'
    );

    if (existing) {
      return null;
    }

    const spots = MockDb._getSpots();
    const course = COURSES_CONFIG.find((c) => c.id === courseId);
    const currentSpots = spots[courseId] ?? course?.spotsLeft ?? 0;

    if (currentSpots <= 0) {
      return null;
    }

    const enrollment: Enrollment = {
      courseId,
      enrolledAt: new Date().toISOString().split('T')[0],
      status: 'active',
      paid: true,
    };

    user.enrollments.push(enrollment);
    users[userIdx] = user;
    MockDb._setUsers(users);

    spots[courseId] = currentSpots - 1;
    MockDb._setSpots(spots);

    return enrollment;
  }

  static async cancelEnrollment(courseId: number): Promise<boolean> {
    await delay();

    const session = MockDb._getSession();

    if (!session) {
      return false;
    }

    const users = MockDb._getUsers();
    const userIdx = users.findIndex((u) => u.id === session.userId);

    if (userIdx === -1) {
      return false;
    }

    const user = users[userIdx];
    const enrollIdx = user.enrollments.findIndex(
      (e) => e.courseId === courseId && e.status === 'active'
    );

    if (enrollIdx === -1) {
      return false;
    }

    user.enrollments[enrollIdx].status = 'cancelled';
    users[userIdx] = user;
    MockDb._setUsers(users);

    const spots = MockDb._getSpots();
    const course = COURSES_CONFIG.find((c) => c.id === courseId);

    spots[courseId] = (spots[courseId] ?? course?.spotsLeft ?? 0) + 1;
    MockDb._setSpots(spots);

    return true;
  }

  static getUserEnrollments(): Enrollment[] {
    const session = MockDb._getSession();

    if (!session) {
      return [];
    }

    const users = MockDb._getUsers();
    const user = users.find((u) => u.id === session.userId);

    return user?.enrollments ?? [];
  }

  static isEnrolled(courseId: number): boolean {
    return MockDb.getUserEnrollments().some(
      (e) => e.courseId === courseId && (e.status === 'active' || e.status === 'pending')
    );
  }

  // ── Favorites ─────────────────────────────────────────────────────────

  static toggleFavoriteCourse(courseId: number): boolean {
    const session = MockDb._getSession();

    if (!session) {
      return false;
    }

    const allFavorites = MockDb._getFavorites();
    const userFavs = allFavorites[session.userId] || { courseIds: [], teacherNames: [] };

    const idx = userFavs.courseIds.indexOf(courseId);

    if (idx === -1) {
      userFavs.courseIds.push(courseId);
    } else {
      userFavs.courseIds.splice(idx, 1);
    }

    allFavorites[session.userId] = userFavs;
    MockDb._setFavorites(allFavorites);

    return idx === -1;
  }

  static toggleFavoriteTeacher(teacherName: string): boolean {
    const session = MockDb._getSession();

    if (!session) {
      return false;
    }

    const allFavorites = MockDb._getFavorites();
    const userFavs = allFavorites[session.userId] || { courseIds: [], teacherNames: [] };

    const idx = userFavs.teacherNames.indexOf(teacherName);

    if (idx === -1) {
      userFavs.teacherNames.push(teacherName);
    } else {
      userFavs.teacherNames.splice(idx, 1);
    }

    allFavorites[session.userId] = userFavs;
    MockDb._setFavorites(allFavorites);

    return idx === -1;
  }

  static getFavoriteCourseIds(): number[] {
    const session = MockDb._getSession();

    if (!session) {
      return [];
    }

    return MockDb._getUserFavorites(session.userId).courseIds;
  }

  static getFavoriteTeacherNames(): string[] {
    const session = MockDb._getSession();

    if (!session) {
      return [];
    }

    return MockDb._getUserFavorites(session.userId).teacherNames;
  }

  static isCourseFavorite(courseId: number): boolean {
    return MockDb.getFavoriteCourseIds().includes(courseId);
  }

  static isTeacherFavorite(teacherName: string): boolean {
    return MockDb.getFavoriteTeacherNames().includes(teacherName);
  }

  static getTeacherProfile(teacherName: string): Teacher | null {
    const fallback = COURSES_CONFIG.find((course) => course.teacher.name === teacherName)?.teacher;
    const overrides = MockDb._getTeacherProfiles()[teacherName];

    if (!fallback && !overrides) {
      return null;
    }

    return {
      name: teacherName,
      bio: overrides?.bio ?? fallback?.bio ?? '',
      images: overrides?.images ?? fallback?.images ?? [],
      achievements: overrides?.achievements ?? fallback?.achievements ?? [],
      experience: overrides?.experience ?? fallback?.experience ?? 0,
      specializations: overrides?.specializations ?? fallback?.specializations ?? [],
      rating: overrides?.rating ?? fallback?.rating ?? 0,
      reviews: fallback?.reviews ?? [],
    };
  }

  static saveTeacherProfile(
    teacherName: string,
    profile: Pick<
      Teacher,
      'bio' | 'images' | 'achievements' | 'experience' | 'specializations' | 'rating'
    >
  ): void {
    const profiles = MockDb._getTeacherProfiles();

    profiles[teacherName] = {
      name: teacherName,
      bio: profile.bio,
      images: profile.images,
      achievements: profile.achievements,
      experience: profile.experience,
      specializations: profile.specializations,
      rating: profile.rating,
    };

    MockDb._setTeacherProfiles(profiles);
  }

  static renameTeacherProfile(previousTeacherName: string, nextTeacherName: string): void {
    if (previousTeacherName === nextTeacherName) {
      return;
    }

    const profiles = MockDb._getTeacherProfiles();
    const previousProfile = profiles[previousTeacherName];

    if (!previousProfile) {
      return;
    }

    profiles[nextTeacherName] = {
      ...previousProfile,
      name: nextTeacherName,
    };
    delete profiles[previousTeacherName];
    MockDb._setTeacherProfiles(profiles);
  }

  static getTeacherCoursesByName(teacherName: string): TeacherCourse[] {
    return MockDb._getTeacherCourses().filter((course) => course.teacher.name === teacherName);
  }

  // ── Courses ───────────────────────────────────────────────────────────

  static getCourses(): CourseConfigItem[] {
    const spots = MockDb._getSpots();

    return COURSES_CONFIG.map((course) => ({
      ...course,
      spotsLeft: spots[course.id] ?? course.spotsLeft,
    }));
  }

  static getCourse(id: number): CourseConfigItem | undefined {
    const spots = MockDb._getSpots();
    const course = COURSES_CONFIG.find((c) => c.id === id);

    if (!course) {
      return undefined;
    }

    return { ...course, spotsLeft: spots[course.id] ?? course.spotsLeft };
  }

  // ── Profile ───────────────────────────────────────────────────────────

  static async updateProfile(
    data: Partial<
      Pick<UserConfig, 'firstName' | 'lastName' | 'phone' | 'city' | 'level' | 'avatar'>
    >
  ): Promise<MockUserData | null> {
    await delay();

    const session = MockDb._getSession();

    if (!session) {
      return null;
    }

    const users = MockDb._getUsers();
    const userIdx = users.findIndex((u) => u.id === session.userId);

    if (userIdx === -1) {
      return null;
    }

    Object.assign(users[userIdx], data);
    MockDb._setUsers(users);

    return MockDb._buildUserData(users[userIdx]);
  }

  // ── Teacher storage helpers ──────────────────────────────────────────

  private static _getTeacherCourses(): TeacherCourse[] {
    const raw = localStorage.getItem(STORAGE_KEYS.teacherCourses);

    return raw ? (JSON.parse(raw) as TeacherCourse[]) : [];
  }

  private static _setTeacherCourses(courses: TeacherCourse[]): void {
    localStorage.setItem(STORAGE_KEYS.teacherCourses, JSON.stringify(courses));
  }

  private static _getLessons(): Lesson[] {
    const raw = localStorage.getItem(STORAGE_KEYS.lessons);

    return raw ? (JSON.parse(raw) as Lesson[]) : [];
  }

  private static _setLessons(lessons: Lesson[]): void {
    localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(lessons));
  }

  private static _getAttendance(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.attendance);

    return raw ? (JSON.parse(raw) as AttendanceRecord[]) : [];
  }

  private static _setAttendance(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
  }

  // ── Teacher courses CRUD ─────────────────────────────────────────────

  static getTeacherCourses(teacherId: number): TeacherCourse[] {
    return MockDb._getTeacherCourses().filter((c) => c.createdByTeacherId === teacherId);
  }

  static async createTeacherCourse(
    teacherId: number,
    data: CourseFormData
  ): Promise<TeacherCourse> {
    await delay();

    const courses = MockDb._getTeacherCourses();
    const allCourseIds = [...COURSES_CONFIG.map((c) => c.id), ...courses.map((c) => c.id)];
    const newId = Math.max(0, ...allCourseIds) + 1;

    const users = MockDb._getUsers();
    const teacher = users.find((u) => u.id === teacherId);
    const teacherName = teacher ? `${teacher.lastName} ${teacher.firstName}` : 'Преподаватель';

    const scheduleEntries: ScheduleEntry[] = data.schedule.map((s) => ({
      weekday: s.weekday,
      timeFrom: s.timeFrom,
      timeTo: s.timeTo,
      location: s.location,
    }));

    const newCourse: TeacherCourse = {
      id: newId,
      name: data.name,
      type: data.type,
      teacher: {
        name: teacherName,
        bio: '',
        images: [],
        achievements: [],
        experience: 0,
        specializations: [data.type],
        rating: 0,
        reviews: [],
      },
      level: data.level as TeacherCourse['level'],
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      price: data.price,
      images: [],
      studio: data.studio,
      city: data.city,
      description: data.description,
      capacity: data.capacity,
      spotsLeft: data.capacity,
      schedule: scheduleEntries,
      music: { artist: '', track: '', url: '' },
      createdByTeacherId: teacherId,
      courseStatus: 'active',
    };

    courses.push(newCourse);
    MockDb._setTeacherCourses(courses);

    const lessons = generateLessonsFromSchedule(newId, scheduleEntries, data.dateFrom, data.dateTo);
    const allLessons = MockDb._getLessons();

    allLessons.push(...lessons);
    MockDb._setLessons(allLessons);

    return newCourse;
  }

  static async updateTeacherCourse(
    courseId: number,
    data: Partial<CourseFormData>
  ): Promise<TeacherCourse | null> {
    await delay();

    const courses = MockDb._getTeacherCourses();
    const idx = courses.findIndex((c) => c.id === courseId);

    if (idx === -1) {
      return null;
    }

    const course = courses[idx];

    if (data.name !== undefined) {
      course.name = data.name;
    }

    if (data.type !== undefined) {
      course.type = data.type;
    }

    if (data.level !== undefined) {
      course.level = data.level as TeacherCourse['level'];
    }

    if (data.dateFrom !== undefined) {
      course.dateFrom = data.dateFrom;
    }

    if (data.dateTo !== undefined) {
      course.dateTo = data.dateTo;
    }

    if (data.price !== undefined) {
      course.price = data.price;
    }

    if (data.studio !== undefined) {
      course.studio = data.studio;
    }

    if (data.city !== undefined) {
      course.city = data.city;
    }

    if (data.description !== undefined) {
      course.description = data.description;
    }

    if (data.capacity !== undefined) {
      course.capacity = data.capacity;
    }

    if (data.schedule !== undefined) {
      course.schedule = data.schedule.map((s) => ({
        weekday: s.weekday,
        timeFrom: s.timeFrom,
        timeTo: s.timeTo,
        location: s.location,
      }));
    }

    courses[idx] = course;
    MockDb._setTeacherCourses(courses);

    return course;
  }

  static async cancelTeacherCourse(courseId: number): Promise<boolean> {
    await delay();

    const courses = MockDb._getTeacherCourses();
    const idx = courses.findIndex((c) => c.id === courseId);

    if (idx === -1) {
      return false;
    }

    courses[idx].courseStatus = 'cancelled';
    MockDb._setTeacherCourses(courses);

    const lessons = MockDb._getLessons();

    for (const lesson of lessons) {
      if (lesson.courseId === courseId && lesson.status === 'scheduled') {
        lesson.status = 'cancelled';
      }
    }

    MockDb._setLessons(lessons);

    return true;
  }

  // ── Lessons ──────────────────────────────────────────────────────────

  static getCourseLessons(courseId: number): Lesson[] {
    return MockDb._getLessons()
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static async cancelLesson(lessonId: number): Promise<boolean> {
    await delay();

    const lessons = MockDb._getLessons();
    const idx = lessons.findIndex((l) => l.id === lessonId);

    if (idx === -1) {
      return false;
    }

    lessons[idx].status = 'cancelled';
    MockDb._setLessons(lessons);

    return true;
  }

  static async updateLesson(
    lessonId: number,
    data: Partial<Pick<Lesson, 'timeFrom' | 'timeTo' | 'location'>>
  ): Promise<Lesson | null> {
    await delay();

    const lessons = MockDb._getLessons();
    const idx = lessons.findIndex((l) => l.id === lessonId);

    if (idx === -1) {
      return null;
    }

    Object.assign(lessons[idx], data);
    MockDb._setLessons(lessons);

    return lessons[idx];
  }

  // ── Students ─────────────────────────────────────────────────────────

  static getCourseStudents(courseId: number): MockUserData[] {
    const users = MockDb._getUsers();

    return users
      .filter((u) =>
        u.enrollments.some(
          (e) => e.courseId === courseId && (e.status === 'active' || e.status === 'pending')
        )
      )
      .map((u) => MockDb._buildUserData(u));
  }

  // ── Attendance ───────────────────────────────────────────────────────

  static async markAttendance(
    lessonId: number,
    studentId: number,
    present: boolean
  ): Promise<void> {
    await delay(100);

    const records = MockDb._getAttendance();
    const idx = records.findIndex((r) => r.lessonId === lessonId && r.studentId === studentId);

    const lesson = MockDb._getLessons().find((l) => l.id === lessonId);

    if (idx === -1) {
      records.push({
        lessonId,
        courseId: lesson?.courseId ?? 0,
        studentId,
        present,
        markedAt: new Date().toISOString().split('T')[0],
      });
    } else {
      records[idx].present = present;
      records[idx].markedAt = new Date().toISOString().split('T')[0];
    }

    MockDb._setAttendance(records);
  }

  static getAttendanceByLesson(lessonId: number): AttendanceRecord[] {
    return MockDb._getAttendance().filter((r) => r.lessonId === lessonId);
  }

  static getAttendanceByCourse(courseId: number): AttendanceRecord[] {
    return MockDb._getAttendance().filter((r) => r.courseId === courseId);
  }

  static getAttendanceByStudent(studentId: number, courseId?: number): AttendanceRecord[] {
    return MockDb._getAttendance().filter(
      (r) => r.studentId === studentId && (courseId === undefined || r.courseId === courseId)
    );
  }

  static getAttendanceStats(
    courseId: number,
    periodFrom?: string,
    periodTo?: string
  ): AttendanceStats {
    const lessons = MockDb.getCourseLessons(courseId).filter((l) => {
      if (periodFrom && l.date < periodFrom) {
        return false;
      }

      if (periodTo && l.date > periodTo) {
        return false;
      }

      return true;
    });

    const attendance = MockDb.getAttendanceByCourse(courseId);
    const students = MockDb.getCourseStudents(courseId);

    const scheduledLessons = lessons.filter((l) => l.status === 'scheduled');
    const cancelledLessons = lessons.filter((l) => l.status === 'cancelled');

    const perLesson = scheduledLessons.map((lesson) => {
      const lessonAtt = attendance.filter((a) => a.lessonId === lesson.id);
      const presentCount = lessonAtt.filter((a) => a.present).length;
      const total = lessonAtt.length || students.length;

      return {
        lessonId: lesson.id,
        date: lesson.date,
        present: presentCount,
        absent: total - presentCount,
        total,
        percent: total > 0 ? Math.round((presentCount / total) * 100) : 0,
      };
    });

    const perStudent = students.map((student) => {
      const studentAtt = attendance.filter(
        (a) => a.studentId === student.id && scheduledLessons.some((l) => l.id === a.lessonId)
      );
      const attended = studentAtt.filter((a) => a.present).length;
      const total = scheduledLessons.length;

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        attended,
        missed: total - attended,
        total,
        percent: total > 0 ? Math.round((attended / total) * 100) : 0,
      };
    });

    const avgPercent =
      perLesson.length > 0
        ? Math.round(perLesson.reduce((sum, l) => sum + l.percent, 0) / perLesson.length)
        : 0;

    return {
      totalLessons: lessons.length,
      conductedLessons: scheduledLessons.length,
      cancelledLessons: cancelledLessons.length,
      avgAttendancePercent: avgPercent,
      totalStudents: students.length,
      perLesson,
      perStudent,
    };
  }
}

MockDb.init();

export { MockDb };
