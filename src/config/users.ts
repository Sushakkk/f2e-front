import { teacherImages } from 'assets/images/teachers';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'pending';

export type UserRole = 'teacher' | 'student';

export type Enrollment = {
  courseId: number;
  enrolledAt: string;
  status: EnrollmentStatus;
  paid: boolean;
};

export type UserConfig = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  city: string;
  level: string;
  role: UserRole;
  registeredAt: string;
  enrollments: Enrollment[];
};

export const USERS_CONFIG: UserConfig[] = [
  {
    id: 1,
    firstName: 'Алина',
    lastName: 'Волкова',
    email: 'alina.volkova@mail.ru',
    phone: '+7 (926) 123-45-67',
    password: 'Alina2025!',
    avatar: teacherImages.woman,
    city: 'Москва',
    level: 'Intermediate',
    role: 'student',
    registeredAt: '2024-09-15',
    enrollments: [
      { courseId: 1, enrolledAt: '2025-05-28', status: 'active', paid: true },
      { courseId: 8, enrolledAt: '2025-02-10', status: 'active', paid: true },
      { courseId: 3, enrolledAt: '2024-12-15', status: 'completed', paid: true },
    ],
  },
  {
    id: 2,
    firstName: 'Виктория',
    lastName: 'Сидорова',
    email: 'vika.sidorova@gmail.com',
    phone: '+7 (903) 987-65-43',
    password: 'Vika_dance1',
    avatar: teacherImages.woman2,
    city: 'Москва',
    level: 'Beginner',
    role: 'student',
    registeredAt: '2024-12-01',
    enrollments: [
      { courseId: 2, enrolledAt: '2025-01-20', status: 'active', paid: true },
      { courseId: 1, enrolledAt: '2025-06-01', status: 'active', paid: true },
      { courseId: 5, enrolledAt: '2025-02-15', status: 'active', paid: true },
      { courseId: 9, enrolledAt: '2025-02-25', status: 'pending', paid: false },
    ],
  },
  {
    id: 3,
    firstName: 'Денис',
    lastName: 'Козлов',
    email: 'denis.kozlov@yandex.ru',
    phone: '+7 (915) 555-12-34',
    password: 'DenisK_99',
    avatar: teacherImages.man,
    city: 'Москва',
    level: 'Advanced',
    role: 'student',
    registeredAt: '2024-08-20',
    enrollments: [
      { courseId: 5, enrolledAt: '2025-02-01', status: 'active', paid: true },
      { courseId: 6, enrolledAt: '2025-02-05', status: 'active', paid: true },
      { courseId: 1, enrolledAt: '2025-05-28', status: 'active', paid: true },
      { courseId: 3, enrolledAt: '2024-11-20', status: 'completed', paid: true },
    ],
  },
  {
    id: 4,
    firstName: 'Кристина',
    lastName: 'Белова',
    email: 'kristina.belova@mail.ru',
    phone: '+7 (977) 234-56-78',
    password: 'Kris_bel78',
    city: 'Санкт-Петербург',
    level: 'Beginner',
    role: 'student',
    registeredAt: '2025-01-10',
    enrollments: [
      { courseId: 4, enrolledAt: '2025-02-05', status: 'active', paid: true },
      { courseId: 1, enrolledAt: '2025-06-02', status: 'active', paid: true },
      { courseId: 8, enrolledAt: '2025-02-20', status: 'active', paid: true },
      { courseId: 7, enrolledAt: '2025-02-12', status: 'active', paid: true },
      { courseId: 9, enrolledAt: '2025-02-28', status: 'pending', paid: false },
    ],
  },
  {
    id: 5,
    firstName: 'Максим',
    lastName: 'Романов',
    email: 'max.romanov@gmail.com',
    phone: '+7 (916) 876-54-32',
    password: 'MaxRom2025',
    avatar: teacherImages.man,
    city: 'Санкт-Петербург',
    level: 'Intermediate',
    role: 'student',
    registeredAt: '2024-10-05',
    enrollments: [
      { courseId: 6, enrolledAt: '2025-02-10', status: 'active', paid: true },
      { courseId: 5, enrolledAt: '2025-02-12', status: 'active', paid: true },
      { courseId: 8, enrolledAt: '2025-02-22', status: 'active', paid: true },
      { courseId: 4, enrolledAt: '2025-01-28', status: 'completed', paid: true },
    ],
  },
  {
    id: 6,
    firstName: 'Полина',
    lastName: 'Морозова',
    email: 'polina.morozova@yandex.ru',
    phone: '+7 (925) 111-22-33',
    password: 'PolinaMrz!',
    avatar: teacherImages.woman,
    city: 'Москва',
    level: 'Advanced',
    role: 'student',
    registeredAt: '2024-07-12',
    enrollments: [
      { courseId: 10, enrolledAt: '2025-02-28', status: 'active', paid: true },
      { courseId: 1, enrolledAt: '2025-05-28', status: 'active', paid: true },
      { courseId: 5, enrolledAt: '2025-02-01', status: 'active', paid: true },
      { courseId: 8, enrolledAt: '2025-02-15', status: 'active', paid: true },
    ],
  },
  {
    id: 7,
    firstName: 'Юлия',
    lastName: 'Кузнецова',
    email: 'yulia.kuznetsova@mail.ru',
    phone: '+7 (964) 333-44-55',
    password: 'YuliaKuz55',
    city: 'Москва',
    level: 'Beginner',
    role: 'student',
    registeredAt: '2025-01-20',
    enrollments: [
      { courseId: 7, enrolledAt: '2025-02-14', status: 'active', paid: true },
      { courseId: 1, enrolledAt: '2025-06-03', status: 'active', paid: true },
      { courseId: 2, enrolledAt: '2025-01-25', status: 'cancelled', paid: false },
    ],
  },
  {
    id: 8,
    firstName: 'Игорь',
    lastName: 'Лебедев',
    email: 'igor.lebedev@gmail.com',
    phone: '+7 (903) 666-77-88',
    password: 'IgorLeb88!',
    avatar: teacherImages.man,
    city: 'Москва',
    level: 'Intermediate',
    role: 'student',
    registeredAt: '2024-11-03',
    enrollments: [
      { courseId: 5, enrolledAt: '2025-02-03', status: 'active', paid: true },
      { courseId: 3, enrolledAt: '2025-01-15', status: 'completed', paid: true },
      { courseId: 10, enrolledAt: '2025-02-28', status: 'pending', paid: false },
    ],
  },
  {
    id: 9,
    firstName: 'Дарья',
    lastName: 'Новикова',
    email: 'daria.novikova@yandex.ru',
    phone: '+7 (926) 999-88-77',
    password: 'DariaNov77',
    avatar: teacherImages.woman2,
    city: 'Санкт-Петербург',
    level: 'Beginner',
    role: 'student',
    registeredAt: '2024-12-18',
    enrollments: [
      { courseId: 2, enrolledAt: '2025-01-30', status: 'active', paid: true },
      { courseId: 5, enrolledAt: '2025-02-18', status: 'active', paid: true },
      { courseId: 8, enrolledAt: '2025-02-25', status: 'active', paid: true },
      { courseId: 9, enrolledAt: '2025-02-26', status: 'active', paid: true },
      { courseId: 4, enrolledAt: '2025-02-08', status: 'active', paid: true },
    ],
  },
  {
    id: 10,
    firstName: 'Софья',
    lastName: 'Андреева',
    email: 'sofya.andreeva@mail.ru',
    phone: '+7 (977) 444-55-66',
    password: 'SofyaA_66',
    avatar: teacherImages.woman,
    city: 'Москва',
    level: 'Intermediate',
    role: 'student',
    registeredAt: '2024-10-22',
    enrollments: [
      { courseId: 10, enrolledAt: '2025-02-27', status: 'active', paid: true },
      { courseId: 8, enrolledAt: '2025-02-18', status: 'active', paid: true },
      { courseId: 1, enrolledAt: '2025-05-30', status: 'pending', paid: false },
      { courseId: 3, enrolledAt: '2024-12-01', status: 'completed', paid: true },
      { courseId: 6, enrolledAt: '2025-01-10', status: 'cancelled', paid: true },
    ],
  },
  {
    id: 11,
    firstName: 'Ксения',
    lastName: 'Карпова',
    email: 'kseniya.karpova@mail.ru',
    phone: '+7 (916) 100-20-30',
    password: 'KseniaK_25!',
    avatar: teacherImages.woman2,
    city: 'Москва',
    level: 'Advanced',
    role: 'teacher',
    registeredAt: '2024-01-10',
    enrollments: [],
  },
  {
    id: 12,
    firstName: 'Артём',
    lastName: 'Кузнецов',
    email: 'artem.kuznetsov@mail.ru',
    phone: '+7 (903) 200-30-40',
    password: 'ArtemK_25!',
    avatar: teacherImages.man,
    city: 'Москва',
    level: 'Advanced',
    role: 'teacher',
    registeredAt: '2024-03-05',
    enrollments: [],
  },
];
