import { courseImages } from 'assets/images/courses';
import { teacherImages } from 'assets/images/teachers';

import type { CourseActivityStatus } from './courseActivity';
import type { CourseLevel } from './levels';
import type { EnrollmentStatus } from './users';

export type ScheduleEntry = {
  weekday: string;
  timeFrom: string;
  timeTo: string;
  location?: string;

  /** Студия для строки расписания (разные адреса по занятиям). */
  studio?: string;
};

export type Review = {
  author: string;
  courseName?: string;
  date: string;
  text: string;
  rating: number;
};

export type Teacher = {
  id?: number;
  name: string;
  bio: string;
  images: string[];
  achievements: string[];
  experience: number;
  specializations: string[];
  rating: number;
  reviews: Review[];
};

export type CourseConfigItem = {
  id: number;
  name: string;
  type: string;
  teacher: Teacher;
  level: CourseLevel;
  dateFrom: string;
  dateTo: string;
  price: number;
  images: string[];
  studio: string;
  schedule?: ScheduleEntry[];
  city: string;
  description: string;
  capacity: number;
  spotsLeft: number;
  music: {
    artist: string;
    track: string;
    url: string;
  };
  canEnroll?: boolean;
  canCancelEnrollment?: boolean;
  canEdit?: boolean;
  canLeaveReview?: boolean;
  firstLessonAt?: string;
  viewerEnrollmentStatus?: EnrollmentStatus | null;

  /** Витрина: active — пока не прошла дата окончания; completed — иначе. По умолчанию active. */
  activityStatus?: CourseActivityStatus;
};

export const COURSES_CONFIG: CourseConfigItem[] = [
  {
    id: 1,
    name: 'High Heels PRO Intensive',
    type: 'High Heels',
    teacher: {
      name: 'Морозова Алиса',
      bio: 'Хореограф и основатель студии. Более 10 лет в танцевальной индустрии.',
      achievements: [
        'Финалист Dance Parade 2023',
        'Судья танцевальных баттлов',
        'Обучила более 500 учеников',
      ],
      experience: 10,
      specializations: ['High Heels', 'Frame Up', 'Lady Style'],
      images: [teacherImages.woman2, teacherImages.woman],
      rating: 4.9,
      reviews: [
        {
          author: 'Алина',
          date: '12.01.2025',
          text: 'Алиса — невероятный педагог! После её интенсива я наконец почувствовала уверенность на каблуках.',
          rating: 5,
        },
        {
          author: 'Виктория',
          date: '28.12.2024',
          text: 'Очень структурированные занятия, всё по делу. Прогресс заметен уже после первой недели.',
          rating: 5,
        },
        {
          author: 'Марина',
          date: '15.11.2024',
          text: 'Энергетика на занятиях потрясающая. Ксения умеет мотивировать и находит подход к каждому.',
          rating: 4,
        },
      ],
    },
    level: 'Продвинутые',
    dateFrom: '20.05',
    dateTo: '02.06',
    price: 15000,
    images: [courseImages.highHeels1, courseImages.highHeels2],
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
    teacher: {
      name: 'Иванова Мария',
      bio: 'Педагог по High Heels с фокусом на работу с начинающими.',
      achievements: ['Призёр Hip Hop International Russia', 'Сертифицированный преподаватель FIDS'],
      experience: 6,
      specializations: ['High Heels', 'Strip Plastic'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 4.5,
      reviews: [
        {
          author: 'Дарья',
          date: '20.01.2025',
          text: 'Мария отлично объясняет базу. Я пришла с нуля и уже через месяц могла танцевать связки!',
          rating: 5,
        },
        {
          author: 'Екатерина',
          date: '05.01.2025',
          text: 'Терпеливый и внимательный педагог. Всегда подскажет, поправит технику.',
          rating: 4,
        },
      ],
    },
    level: 'Начинающие',
    dateFrom: '27.05',
    dateTo: '10.06',
    price: 8000,
    images: [courseImages.highHeels2, courseImages.highHeels2, courseImages.highHeels2],
    studio: 'DanceLab',
    schedule: [{ weekday: 'Вт, Чт', timeFrom: '18:00', timeTo: '19:30', location: 'м. Курская' }],
    city: 'Москва',
    description: 'Первый шаг в мир каблуков.',
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
    teacher: {
      name: 'Смирнова Анна',
      bio: 'Танцовщица и хореограф современного танца. Выступала на международных фестивалях.',
      achievements: ['Участник Open Look Festival', 'Стипендиат программы DanceWeb'],
      experience: 8,
      specializations: ['Contemporary', 'Modern', 'Импровизация'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 4.7,
      reviews: [
        {
          author: 'Полина',
          date: '18.01.2025',
          text: 'Анна раскрывает танец с другой стороны. Много работы с импровизацией — это бесценно.',
          rating: 5,
        },
        {
          author: 'Олег',
          date: '02.01.2025',
          text: 'Глубокий подход к движению. После курса стал совсем иначе чувствовать своё тело.',
          rating: 5,
        },
        {
          author: 'Настя',
          date: '10.12.2024',
          text: 'Хороший курс, но хотелось бы больше техники и меньше импровизации.',
          rating: 4,
        },
      ],
    },
    level: 'Средний уровень',
    dateFrom: '03.06',
    dateTo: '17.06',
    price: 9500,
    images: [courseImages.contemporary, courseImages.contemporary, courseImages.contemporary],
    studio: 'Студия движения',
    schedule: [
      {
        weekday: 'Пн, Ср',
        timeFrom: '17:00',
        timeTo: '18:30',
        location: 'м. Чистые пруды',
      },
    ],
    city: 'Москва',
    description: 'Импровизация и работа с телом.',
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
    teacher: {
      name: 'Орлова Дарья',
      bio: 'Энергичный тренер с уникальным стилем преподавания. Работает с детскими и взрослыми группами.',
      achievements: ['Победитель Groove Dance Champ 2022', 'Танцовщица клипов российских артистов'],
      experience: 5,
      specializations: ['Jazz Funk', 'Hip-Hop', 'Commercial'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 4.3,
      reviews: [
        {
          author: 'Кристина',
          date: '22.01.2025',
          text: 'Дарья заряжает энергией! Занятия пролетают незаметно, хочется ещё и ещё.',
          rating: 5,
        },
        {
          author: 'Софья',
          date: '08.01.2025',
          text: 'Классные связки, много драйва. Иногда темп слишком быстрый для новичков.',
          rating: 4,
        },
      ],
    },
    level: 'Начинающие',
    dateFrom: '10.06',
    dateTo: '24.06',
    price: 7000,
    images: [courseImages.jazzFunk, courseImages.jazzFunk, courseImages.jazzFunk],
    studio: 'Арт-пространство',
    schedule: [
      {
        weekday: 'Вт, Чт, Сб',
        timeFrom: '12:00',
        timeTo: '13:30',
        location: 'м. Таганская',
      },
    ],
    city: 'Санкт-Петербург',
    description: 'Яркие связки и музыкальность.',
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
    teacher: {
      name: 'Кузнецов Артём',
      bio: 'Один из ведущих vogue-танцоров России. Регулярный участник ballroom-сцены.',
      achievements: [
        'Чемпион Vogue Ball Moscow 2023',
        'Основатель House of Phantom',
        'Судья международных баллов',
      ],
      experience: 9,
      specializations: ['Vogue', 'Waacking', 'Ballroom'],
      images: [teacherImages.man, teacherImages.man, teacherImages.man],
      rating: 4.8,
      reviews: [
        {
          author: 'Денис',
          date: '25.01.2025',
          text: 'Артём — легенда vogue-сцены. Учиться у него — это отдельный уровень вдохновения.',
          rating: 5,
        },
        {
          author: 'Лера',
          date: '14.01.2025',
          text: 'Сложно, но очень круто. Артём требовательный, но справедливый. Результат того стоит.',
          rating: 5,
        },
        {
          author: 'Игорь',
          date: '30.12.2024',
          text: 'Курс помог подготовиться к первому баллу. Спасибо за веру в учеников!',
          rating: 4,
        },
      ],
    },
    level: 'Продвинутые',
    dateFrom: '17.06',
    dateTo: '01.07',
    price: 12000,
    images: [courseImages.vogue, courseImages.vogue, courseImages.vogue],
    studio: 'Грация',
    schedule: [
      {
        weekday: 'Ср, Пт',
        timeFrom: '20:00',
        timeTo: '21:30',
        location: 'м. Новослободская',
      },
    ],
    city: 'Москва',
    description: 'Подготовка к баттлам.',
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
    teacher: {
      name: 'Павлова Елена',
      bio: 'Хореограф новой школы хип-хопа. Ставит номера для шоу и концертов.',
      achievements: ['Финалист SDK Europe', 'Хореограф шоу «Танцы»'],
      experience: 7,
      specializations: ['Hip-Hop', 'New Style', 'Popping'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 4.6,
      reviews: [
        {
          author: 'Максим',
          date: '19.01.2025',
          text: 'Елена разбирает каждое движение детально. Отличный баланс теории и практики.',
          rating: 5,
        },
        {
          author: 'Аня',
          date: '03.01.2025',
          text: 'Очень крутая атмосфера на занятиях. Чувствуешь себя частью команды.',
          rating: 4,
        },
      ],
    },
    level: 'Средний уровень',
    dateFrom: '01.07',
    dateTo: '15.07',
    price: 9000,
    images: [courseImages.hipHop, courseImages.hipHop, courseImages.hipHop],
    studio: 'ТанцХаб',
    schedule: [
      {
        weekday: 'Пн, Чт',
        timeFrom: '18:00',
        timeTo: '19:30',
        location: 'м. Павелецкая',
      },
    ],
    city: 'Санкт-Петербург',
    description: 'Грув и актуальные стили.',
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
    teacher: {
      name: 'Мельникова Ольга',
      bio: 'Амбассадор dancehall-культуры в России. Проводит мастер-классы по всей стране.',
      achievements: ['Победитель Dancehall Queen Contest 2021', 'Обучение на Ямайке'],
      experience: 6,
      specializations: ['Dancehall', 'Afro', 'Reggaeton'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 4.4,
      reviews: [
        {
          author: 'Юлия',
          date: '16.01.2025',
          text: 'Ольга передаёт настоящий вайб dancehall. После занятий хочется танцевать везде!',
          rating: 5,
        },
        {
          author: 'Карина',
          date: '29.12.2024',
          text: 'Весёлые и позитивные уроки. Ольга умеет создать расслабленную атмосферу.',
          rating: 4,
        },
        {
          author: 'Светлана',
          date: '12.12.2024',
          text: 'Хотелось бы чуть больше разбора техники отдельных степов.',
          rating: 4,
        },
      ],
    },
    level: 'Начинающие',
    dateFrom: '15.07',
    dateTo: '29.07',
    price: 7500,
    images: [courseImages.dancehall, courseImages.dancehall, courseImages.dancehall],
    studio: 'DanceLab',
    schedule: [{ weekday: 'Вт, Сб', timeFrom: '14:00', timeTo: '15:30', location: 'м. Курская' }],
    city: 'Москва',
    description: 'Ямайские ритмы.',
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
    teacher: {
      name: 'Морозова Алиса',
      bio: 'Хореограф и основатель студии. Более 10 лет в танцевальной индустрии.',
      achievements: [
        'Финалист Dance Parade 2023',
        'Судья танцевальных баттлов',
        'Обучила более 500 учеников',
      ],
      experience: 10,
      specializations: ['High Heels', 'Frame Up', 'Lady Style'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 4.9,
      reviews: [
        {
          author: 'Алина',
          date: '12.01.2025',
          text: 'Алиса — невероятный педагог! После её интенсива я наконец почувствовала уверенность на каблуках.',
          rating: 5,
        },
        {
          author: 'Виктория',
          date: '28.12.2024',
          text: 'Очень структурированные занятия, всё по делу. Прогресс заметен уже после первой недели.',
          rating: 5,
        },
        {
          author: 'Марина',
          date: '15.11.2024',
          text: 'Энергетика на занятиях потрясающая. Ксения умеет мотивировать и находит подход к каждому.',
          rating: 4,
        },
      ],
    },
    level: 'Продвинутые',
    dateFrom: '29.07',
    dateTo: '12.08',
    price: 13000,
    images: [courseImages.frameUp, courseImages.frameUp, courseImages.frameUp],
    studio: 'Арт-пространство',
    schedule: [
      {
        weekday: 'Пн, Ср, Пт',
        timeFrom: '20:00',
        timeTo: '21:30',
        location: 'м. Таганская',
      },
    ],
    city: 'Москва',
    description: 'Сценическая подача.',
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
    teacher: {
      name: 'Лебедева Ирина',
      bio: 'Мастер спорта по художественной гимнастике. Специалист по растяжке и гибкости.',
      achievements: ['Мастер спорта по художественной гимнастике', 'Сертификат PNF Stretching'],
      experience: 12,
      specializations: ['Stretching', 'Гибкость', 'Художественная гимнастика'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 5.0,
      reviews: [
        {
          author: 'Наталья',
          date: '24.01.2025',
          text: 'Ирина — волшебница! За месяц я села на шпагат, хотя думала, что это невозможно.',
          rating: 5,
        },
        {
          author: 'Оксана',
          date: '10.01.2025',
          text: 'Очень бережный подход к растяжке. Никакой боли, только прогресс.',
          rating: 5,
        },
        {
          author: 'Елена',
          date: '22.12.2024',
          text: 'Лучший преподаватель по стретчингу. Всё объясняет с точки зрения анатомии.',
          rating: 5,
        },
      ],
    },
    level: 'Начинающие',
    dateFrom: '05.08',
    dateTo: '19.08',
    price: 6000,
    images: [courseImages.stretching, courseImages.stretching, courseImages.stretching],
    studio: 'Студия движения',
    schedule: [
      {
        weekday: 'Вт, Чт, Сб',
        timeFrom: '10:00',
        timeTo: '11:30',
        location: 'м. Чистые пруды',
      },
    ],
    city: 'Санкт-Петербург',
    description: 'Мягкая растяжка.',
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
    teacher: {
      name: 'Соколова Полина',
      bio: 'Танцовщица и модель. Развивает направление Lady Style в России.',
      achievements: ['Призёр Lady Dance Cup 2022', 'Хореограф модных показов'],
      experience: 7,
      specializations: ['Lady Style', 'High Heels', 'Strip Plastic'],
      images: [teacherImages.woman, teacherImages.woman, teacherImages.woman],
      rating: 4.6,
      reviews: [
        {
          author: 'Ирина',
          date: '21.01.2025',
          text: 'Полина учит не просто движениям, а женственности и подаче. Это меняет всё!',
          rating: 5,
        },
        {
          author: 'Мила',
          date: '06.01.2025',
          text: 'Красивые постановки, приятная музыка. Чувствуешь себя звездой на каждом занятии.',
          rating: 5,
        },
        {
          author: 'Александра',
          date: '18.12.2024',
          text: 'Хороший курс, но хотелось бы больше внимания технике рук.',
          rating: 4,
        },
      ],
    },
    level: 'Средний уровень',
    dateFrom: '18.08',
    dateTo: '01.09',
    price: 9000,
    images: [courseImages.ladyStyle, courseImages.ladyStyle, courseImages.ladyStyle],
    studio: 'Грация',
    schedule: [
      {
        weekday: 'Пн, Ср',
        timeFrom: '19:00',
        timeTo: '20:30',
        location: 'м. Новослободская',
      },
    ],
    city: 'Москва',
    description: 'Плавность и женственность.',
    capacity: 30,
    spotsLeft: 14,
    music: {
      artist: 'Lana Del Rey',
      track: 'West Coast',
      url: 'https://open.spotify.com/track/2nMeu6UenVvwUktBCpLMK9',
    },
  },
];
