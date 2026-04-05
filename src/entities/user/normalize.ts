import type { UserClient } from './client';
import type { BackendUser } from './server';

const USER_LEVEL_MAP: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний уровень',
  advanced: 'Продвинутый',
  any: 'Любой уровень',
};

export const normalizeUser = (user: BackendUser): UserClient => ({
  id: user.id,
  username: user.username,
  firstName: user.first_name,
  middleName: user.middle_name || undefined,
  lastName: user.last_name,
  email: user.email,
  phone: '',
  avatar: user.avatar ?? undefined,
  city: user.city ?? '',
  level: USER_LEVEL_MAP[user.dance_level] ?? user.dance_level,
  role: user.role,
  teacher: user.teacher
    ? {
        bio: user.teacher.bio ?? '',
        images: user.teacher.images ?? [],
        achievements: user.teacher.achievements ?? [],
        experience: user.teacher.experience ?? 0,
        specializations: user.teacher.specializations ?? [],
        rating: Number(user.teacher.rating ?? 0),
      }
    : undefined,
  registeredAt: '',
  favoriteCourseIds: user.favorite_course_ids ?? [],
  favoriteTeacherNames: [],
  preferredTimeFrom: user.preferred_time_from ?? undefined,
  preferredTimeTo: user.preferred_time_to ?? undefined,
  priceFrom: user.price_from ?? null,
  priceTo: user.price_to ?? null,
  preferredWeekdays: user.preferred_weekdays ?? [],
  preferredDanceStyles: user.preferred_dance_styles ?? [],
  flags: {
    surveyCompleted: Boolean(user.survey_completed),
  },
});
