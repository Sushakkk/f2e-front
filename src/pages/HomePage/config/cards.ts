import { courseImages } from 'assets/images/courses';

import type { CourseLevel } from './levels';

export type { CourseLevel } from './levels';

export type ScheduleEntry = {
  weekday: string;
  timeFrom: string;
  timeTo: string;
  location?: string;
};

export type CourseConfigItem = {
  id: number;
  name: string;
  type: string;
  teacher: string;
  level: CourseLevel;
  dateFrom: string;
  dateTo: string;
  price: number;
  image: string;
  studio: string;
  weekdays?: string[];
  timeFrom?: string;
  timeTo?: string;
  schedule?: ScheduleEntry[];
  city: string;
  description: string;
  location?: string;
  capacity: number;
  spotsLeft: number;
  music: {
    artist: string;
    track: string;
    url: string;
  };
};

export const COURSES_CONFIG: CourseConfigItem[] = [
  {
    id: 1,
    name: 'High Heels PRO Intensive',
    type: 'High Heels',
    teacher: 'Карпова Ксения',
    level: 'Advanced',
    dateFrom: '10.06',
    dateTo: '25.06',
    price: 15000,
    image: courseImages.highHeels1,
    studio: 'ТанцХаб',
    city: 'Москва',
    description: 'Интенсив с плавающим расписанием. Подходит для занятых танцоров.',
    capacity: 20,
    spotsLeft: 6,
    schedule: [
      { weekday: 'Пн, Вт', timeFrom: '20:00', timeTo: '21:00', location: 'м. Павелецкая' },
      { weekday: 'Ср', timeFrom: '18:00', timeTo: '19:00', location: 'м. Курская' },
      { weekday: 'Пт', timeFrom: '21:00', timeTo: '22:30', location: 'м. Павелецкая' },
    ],
    music: {
      artist: 'Tinashe',
      track: 'Needs',
      url: 'https://open.spotify.com/track/1cUq5d1b0KfH7lPp7sGzvC',
    },
  },
  {
    id: 2,
    name: 'High Heels с нуля',
    type: 'High Heels',
    teacher: 'Иванова Мария',
    level: 'Beginner',
    dateFrom: '03.02',
    dateTo: '15.02',
    price: 8000,
    image: courseImages.highHeels2,
    studio: 'DanceLab',
    weekdays: ['Вт', 'Чт'],
    timeFrom: '18:00',
    timeTo: '19:30',
    city: 'Москва',
    description: 'Первый шаг в мир каблуков.',
    location: 'м. Курская',
    capacity: 30,
    spotsLeft: 12,
    music: {
      artist: 'Beyoncé',
      track: 'Partition',
      url: 'https://open.spotify.com/track/6RX5iL93VZ5fKmyvNXvF1r',
    },
  },
  {
    id: 3,
    name: 'Основы Contemporary',
    type: 'Contemporary',
    teacher: 'Смирнова Анна',
    level: 'Intermediate',
    dateFrom: '05.02',
    dateTo: '20.02',
    price: 9500,
    image: courseImages.contemporary,
    studio: 'Студия движения',
    weekdays: ['Пн', 'Ср'],
    timeFrom: '17:00',
    timeTo: '18:30',
    city: 'Москва',
    description: 'Импровизация и работа с телом.',
    location: 'м. Чистые пруды',
    capacity: 25,
    spotsLeft: 8,
    music: {
      artist: 'Ludovico Einaudi',
      track: 'Experience',
      url: 'https://open.spotify.com/track/1BncfTJAWxrsxyT9culBrj',
    },
  },
  {
    id: 4,
    name: 'Jazz Funk для начинающих',
    type: 'Jazz Funk',
    teacher: 'Орлова Дарья',
    level: 'Beginner',
    dateFrom: '10.02',
    dateTo: '22.02',
    price: 7000,
    image: courseImages.jazzFunk,
    studio: 'Арт-пространство',
    weekdays: ['Вт', 'Чт', 'Сб'],
    timeFrom: '12:00',
    timeTo: '13:30',
    city: 'Санкт-Петербург',
    description: 'Яркие связки и музыкальность.',
    location: 'м. Таганская',
    capacity: 35,
    spotsLeft: 18,
    music: {
      artist: 'Doja Cat',
      track: 'Woman',
      url: 'https://open.spotify.com/track/6Uj1ctrBOjOas8xZXGqKk4',
    },
  },
  {
    id: 5,
    name: 'Vogue: продвинутый уровень',
    type: 'Vogue',
    teacher: 'Кузнецов Артём',
    level: 'Advanced',
    dateFrom: '15.02',
    dateTo: '28.02',
    price: 12000,
    image: courseImages.vogue,
    studio: 'Грация',
    weekdays: ['Ср', 'Пт'],
    timeFrom: '20:00',
    timeTo: '21:30',
    city: 'Москва',
    description: 'Подготовка к баттлам.',
    location: 'м. Новослободская',
    capacity: 20,
    spotsLeft: 5,
    music: {
      artist: 'Kevin Aviance',
      track: 'Cunty',
      url: 'https://open.spotify.com/track/2Yk4HhPpG9S2kT2tG9kX7R',
    },
  },
  {
    id: 6,
    name: 'Hip-Hop: новая волна',
    type: 'Hip-Hop',
    teacher: 'Павлова Елена',
    level: 'Intermediate',
    dateFrom: '16.02',
    dateTo: '28.02',
    price: 9000,
    image: courseImages.hipHop,
    studio: 'ТанцХаб',
    weekdays: ['Пн', 'Чт'],
    timeFrom: '18:00',
    timeTo: '19:30',
    city: 'Санкт-Петербург',
    description: 'Грув и актуальные стили.',
    location: 'м. Павелецкая',
    capacity: 40,
    spotsLeft: 22,
    music: {
      artist: 'Travis Scott',
      track: 'FE!N',
      url: 'https://open.spotify.com/track/42VsgItocQwOQC3XWZ8JNA',
    },
  },
  {
    id: 7,
    name: 'Dancehall: первые шаги',
    type: 'Dancehall',
    teacher: 'Мельникова Ольга',
    level: 'Beginner',
    dateFrom: '18.02',
    dateTo: '28.02',
    price: 7500,
    image: courseImages.dancehall,
    studio: 'DanceLab',
    weekdays: ['Вт', 'Сб'],
    timeFrom: '14:00',
    timeTo: '15:30',
    city: 'Москва',
    description: 'Ямайские ритмы.',
    location: 'м. Курская',
    capacity: 30,
    spotsLeft: 15,
    music: {
      artist: 'Sean Paul',
      track: 'Temperature',
      url: 'https://open.spotify.com/track/0k2GOhqsrxDTAbFFSdNJjT',
    },
  },
  {
    id: 8,
    name: 'Frame Up: мастерский класс',
    type: 'Frame Up',
    teacher: 'Карпова Ксения',
    level: 'Advanced',
    dateFrom: '20.02',
    dateTo: '05.03',
    price: 13000,
    image: courseImages.frameUp,
    studio: 'Арт-пространство',
    weekdays: ['Пн', 'Ср', 'Пт'],
    timeFrom: '20:00',
    timeTo: '21:30',
    city: 'Москва',
    description: 'Сценическая подача.',
    location: 'м. Таганская',
    capacity: 25,
    spotsLeft: 7,
    music: {
      artist: 'The Weeknd',
      track: 'The Hills',
      url: 'https://open.spotify.com/track/7fBv7CLKzipRk6EC6TWHOB',
    },
  },
  {
    id: 9,
    name: 'Stretching для начинающих',
    type: 'Stretching',
    teacher: 'Лебедева Ирина',
    level: 'Beginner',
    dateFrom: '01.03',
    dateTo: '12.03',
    price: 6000,
    image: courseImages.stretching,
    studio: 'Студия движения',
    weekdays: ['Вт', 'Чт', 'Сб'],
    timeFrom: '10:00',
    timeTo: '11:30',
    city: 'Санкт-Петербург',
    description: 'Мягкая растяжка.',
    location: 'м. Чистые пруды',
    capacity: 20,
    spotsLeft: 10,
    music: {
      artist: 'Enya',
      track: 'Only Time',
      url: 'https://open.spotify.com/track/6FLwmdmW77N1Pxb1aWsZmO',
    },
  },
  {
    id: 10,
    name: 'Lady Style: грация и пластика',
    type: 'Lady Style',
    teacher: 'Соколова Полина',
    level: 'Intermediate',
    dateFrom: '03.03',
    dateTo: '16.03',
    price: 9000,
    image: courseImages.ladyStyle,
    studio: 'Грация',
    weekdays: ['Пн', 'Ср'],
    timeFrom: '19:00',
    timeTo: '20:30',
    city: 'Москва',
    description: 'Плавность и женственность.',
    location: 'м. Новослободская',
    capacity: 30,
    spotsLeft: 14,
    music: {
      artist: 'Lana Del Rey',
      track: 'West Coast',
      url: 'https://open.spotify.com/track/2nMeu6UenVvwUktBCpLMK9',
    },
  },
];
