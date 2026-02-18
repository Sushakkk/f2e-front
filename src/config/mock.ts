import type { Course } from './types';

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'High heels',
    teacher: 'Карпова Ксения',
    studio: 'Dance Point',
    danceType: 'High heels',
    level: 'intermediate',
    dateFrom: '2026-09-22',
    dateTo: '2026-09-30',
    priceRub: 10000,
    coverUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
    isRecommended: true,
  },
  {
    id: 'c2',
    title: 'Push Up',
    teacher: 'Смирнова Анна',
    studio: 'Move Studio',
    danceType: 'Push Up',
    level: 'beginner',
    dateFrom: '2026-10-01',
    dateTo: '2026-10-10',
    priceRub: 6500,
    coverUrl:
      'https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1600&q=80',
    subtitle: '20 sit up a day',
    isRecommended: true,
  },
  {
    id: 'c3',
    title: 'Knee Push Up',
    teacher: 'Иванова Мария',
    studio: 'Base Dance',
    danceType: 'Knee Push Up',
    level: 'beginner',
    dateFrom: '2026-10-12',
    dateTo: '2026-10-20',
    priceRub: 7200,
    coverUrl:
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=1600&q=80',
    subtitle: '20 sit up a day',
  },
  {
    id: 'c4',
    title: 'Латина: базовый курс',
    teacher: 'Петрова Елена',
    studio: 'Latin Hall',
    danceType: 'Латина',
    level: 'beginner',
    dateFrom: '2026-11-01',
    dateTo: '2026-11-15',
    priceRub: 8900,
    coverUrl:
      'https://images.unsplash.com/photo-1524593119773-9ef4f6b3a1a5?auto=format&fit=crop&w=1600&q=80',
  },
];
