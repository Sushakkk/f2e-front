import courseImg9 from '../img/photo-1508214751196-bcfd4ca60f91.jpg';
import courseImg5 from '../img/photo-1508704019882-f9cf40e475b4.jpg';
import courseImg4 from '../img/photo-1518611012118-696072aa579a.jpg';
import courseImg10 from '../img/photo-1518837695005-2083093ee35b.jpg';
import courseImg6 from '../img/photo-1520975916090-3105956dac38.jpg';
import courseImg3 from '../img/photo-1524594152303-9fd13543fe6e.jpg';
import courseImg2 from '../img/photo-1547153760-18fc86324498.jpg';
import courseImg11 from '../img/photo-1594736797933-d0501ba2fe65.jpg';
import courseImg1 from '../img/photo-1599058917212-d750089bc07e.jpg';
import courseImg8 from '../img/photo-1599058918144-1ffabb6ab9a0.jpg';

export type { CourseLevel } from './levels';
import type { CourseLevel } from './levels';

export type CourseConfigItem = {
  id: number;
  title: string;
  teacher: string;
  level: CourseLevel;
  dateFrom: string;
  dateTo: string;
  price: number;
  image: string;
};

export const COURSES_CONFIG: CourseConfigItem[] = [
  {
    id: 1,
    title: 'High heels',
    teacher: 'Карпова Ксения',
    level: 'Intermediate',
    dateFrom: '22.09',
    dateTo: '30.09',
    price: 10000,
    image: courseImg1,
  },
  {
    id: 2,
    title: 'High heels',
    teacher: 'Иванова Мария',
    level: 'Beginner',
    dateFrom: '01.10',
    dateTo: '10.10',
    price: 8000,
    image: courseImg2,
  },
  {
    id: 3,
    title: 'Contemporary',
    teacher: 'Смирнова Анна',
    level: 'Intermediate',
    dateFrom: '05.10',
    dateTo: '20.10',
    price: 9500,
    image: courseImg3,
  },
  {
    id: 4,
    title: 'Jazz Funk',
    teacher: 'Орлова Дарья',
    level: 'Beginner',
    dateFrom: '12.10',
    dateTo: '22.10',
    price: 7000,
    image: courseImg4,
  },
  {
    id: 5,
    title: 'Vogue',
    teacher: 'Кузнецов Артём',
    level: 'Advanced',
    dateFrom: '15.10',
    dateTo: '31.10',
    price: 12000,
    image: courseImg5,
  },
  {
    id: 6,
    title: 'Hip-hop',
    teacher: 'Павлова Елена',
    level: 'Intermediate',
    dateFrom: '18.10',
    dateTo: '28.10',
    price: 9000,
    image: courseImg6,
  },
  {
    id: 7,
    title: 'Dancehall',
    teacher: 'Мельникова Ольга',
    level: 'Beginner',
    dateFrom: '20.10',
    dateTo: '30.10',
    price: 7500,
    image: courseImg2,
  },
  {
    id: 8,
    title: 'Frame up',
    teacher: 'Карпова Ксения',
    level: 'Advanced',
    dateFrom: '25.10',
    dateTo: '05.11',
    price: 13000,
    image: courseImg8,
  },
  {
    id: 9,
    title: 'Stretching',
    teacher: 'Лебедева Ирина',
    level: 'Beginner',
    dateFrom: '02.11',
    dateTo: '12.11',
    price: 6000,
    image: courseImg9,
  },
  {
    id: 10,
    title: 'Lady style',
    teacher: 'Соколова Полина',
    level: 'Intermediate',
    dateFrom: '05.11',
    dateTo: '18.11',
    price: 9000,
    image: courseImg10,
  },
  {
    id: 11,
    title: 'Heels choreography',
    teacher: 'Карпова Ксения',
    level: 'Advanced',
    dateFrom: '10.11',
    dateTo: '25.11',
    price: 14000,
    image: courseImg11,
  },
  {
    id: 12,
    title: 'Body movement',
    teacher: 'Романова Алина',
    level: 'Beginner',
    dateFrom: '15.11',
    dateTo: '30.11',
    price: 7000,
    image: courseImg9,
  },
];
