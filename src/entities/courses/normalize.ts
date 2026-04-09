import type { ScheduleEntry } from 'config/cards';
import type { CourseLevel } from 'config/levels';

import type { CourseListItemClient } from './client';
import type { CourseListItemServer, ScheduleEntryServer } from './server';

const LEVEL_MAP: Record<string, CourseLevel> = {
  beginner: 'Начинающие',
  intermediate: 'Средний уровень',
  advanced: 'Продвинутые',
  any: 'Любой уровень',
};

function formatShortDate(iso: string): string {
  if (!iso) {
    return '';
  }

  const d = new Date(iso);

  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function normalizeScheduleEntry(entry: ScheduleEntryServer): ScheduleEntry {
  return {
    weekday: entry.weekday,
    timeFrom: entry.time_from,
    timeTo: entry.time_to,
  };
}

/**
 * Преобразует ответ списка курсов API в формат CourseConfigItem.
 */
export function normalizeCourseListItem(data: CourseListItemServer): CourseListItemClient {
  return {
    id: data.id,
    name: data.name,
    type: data.dance_style,
    teacher: {
      id: data.teacher_id,
      name: data.teacher_name,
      bio: '',
      images: [],
      achievements: [],
      experience: 0,
      specializations: [],
      rating: 0,
      reviews: [],
    },
    level: LEVEL_MAP[data.level] ?? 'Любой уровень',
    dateFrom: formatShortDate(data.date_from),
    dateTo: formatShortDate(data.date_to),
    price: data.price,
    images: data.image ? [data.image] : [],
    studio: data.studio,
    schedule: (data.schedule ?? []).map(normalizeScheduleEntry),
    city: data.city,
    description: '',
    capacity: 0,
    spotsLeft: 0,
    music: {
      artist: '',
      track: '',
      url: '',
    },
  };
}
