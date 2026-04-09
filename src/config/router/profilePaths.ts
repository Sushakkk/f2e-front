import type { ProfileSection } from 'store/ProfilePageStore';

/** Сегмент URL для раздела профиля (после `/profile/`) */
export const PROFILE_SECTION_SLUG: Record<ProfileSection, string> = {
  profile: 'personal',
  enrollments: 'enrollments',
  favorites: 'favorites',
  teacherCourses: 'courses',
  students: 'students',
  stats: 'stats',
};

const SLUG_TO_SECTION: Record<string, ProfileSection> = {
  personal: 'profile',
  enrollments: 'enrollments',
  favorites: 'favorites',
  courses: 'teacherCourses',
  students: 'students',
  stats: 'stats',
};

/** Путь по умолчанию при переходе в «Профиль» из шапки/подвала */
export const PROFILE_DEFAULT_PATH = `/profile/${PROFILE_SECTION_SLUG.profile}`;

export function profilePath(section: ProfileSection): string {
  return `/profile/${PROFILE_SECTION_SLUG[section]}`;
}

export function profileSectionFromSlug(slug: string | undefined): ProfileSection | null {
  if (!slug) {
    return null;
  }

  return SLUG_TO_SECTION[slug] ?? null;
}

export const TEACHER_ONLY_PROFILE_SECTIONS: ProfileSection[] = [
  'teacherCourses',
  'students',
  'stats',
];

/** Query в `/profile/courses`: `create=1` — форма создания курса */
export const PROFILE_COURSES_QUERY_CREATE = 'create';

/** Query в `/profile/courses`: `edit=<id>` — форма редактирования курса */
export const PROFILE_COURSES_QUERY_EDIT = 'edit';
