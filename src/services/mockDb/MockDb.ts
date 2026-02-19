import { COURSES_CONFIG, type CourseConfigItem } from 'config/cards';
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
  initialized: 'mockDb_initialized',
} as const;

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
  static init(): void {
    if (localStorage.getItem(STORAGE_KEYS.initialized)) {
      return;
    }

    const users = JSON.parse(JSON.stringify(USERS_CONFIG)) as UserConfig[];

    const spots: CourseSpotsMap = {};

    for (const c of COURSES_CONFIG) {
      spots[c.id] = c.spotsLeft;
    }

    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.spots, JSON.stringify(spots));
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
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
}

MockDb.init();

export { MockDb };
