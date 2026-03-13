import { courseImages } from 'assets/images/courses';

export type StudioData = {
  id: string;
  name: string;
  address: string;
  metro: string;
  city: string;
  lat: number;
  lng: number;
  image: string;
  courses: string[];
};

export type MapFilters = {
  cities: string[];
  metro: string[];
  studios: string[];
  danceTypes: string[];
};

export const EMPTY_FILTERS: MapFilters = { cities: [], metro: [], studios: [], danceTypes: [] };

export const DEFAULT_FILTERS: MapFilters = {
  cities: ['Москва'],
  metro: [],
  studios: [],
  danceTypes: [],
};

export const RUSSIA_CENTER: [number, number] = [55.7558, 49.1];

export const MOSCOW_CENTER: [number, number] = [55.751, 37.632];

export const DEFAULT_ZOOM = 5;

export const MOSCOW_ZOOM = 12;

export const MARKER_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="26" viewBox="0 0 20 26"><path d="M10 0C4.477 0 0 4.477 0 10c0 6.75 9 15.45 9.4 15.85a.85.85 0 001.2 0C11 25.45 20 16.75 20 10 20 4.477 15.523 0 10 0z" fill="#7707B8"/><circle cx="10" cy="10" r="3.5" fill="white"/></svg>'
  );

export const MARKER_ACTIVE_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 20 26"><path d="M10 0C4.477 0 0 4.477 0 10c0 6.75 9 15.45 9.4 15.85a.85.85 0 001.2 0C11 25.45 20 16.75 20 10 20 4.477 15.523 0 10 0z" fill="#7707B8"/><circle cx="10" cy="10" r="3.5" fill="white"/></svg>'
  );

export const STUDIOS_MAP: StudioData[] = [
  {
    id: 'tanchub',
    name: 'ТанцХаб',
    address: 'Кожевническая ул. д43',
    metro: 'м. Павелецкая',
    city: 'Москва',
    lat: 55.7298,
    lng: 37.6489,
    image: courseImages.highHeels1,
    courses: ['High Heels', 'Hip-Hop'],
  },
  {
    id: 'dancelab',
    name: 'DanceLab',
    address: 'Земляной Вал, д25',
    metro: 'м. Курская',
    city: 'Москва',
    lat: 55.7584,
    lng: 37.6614,
    image: courseImages.dancehall,
    courses: ['High Heels', 'Dancehall'],
  },
  {
    id: 'studio-dvizheniya',
    name: 'Студия движения',
    address: 'Чистопрудный б-р, д12',
    metro: 'м. Чистые пруды',
    city: 'Москва',
    lat: 55.7652,
    lng: 37.6385,
    image: courseImages.contemporary,
    courses: ['Contemporary', 'Stretching'],
  },
  {
    id: 'art-space',
    name: 'Арт-пространство',
    address: 'Марксистская ул. д9',
    metro: 'м. Таганская',
    city: 'Москва',
    lat: 55.7394,
    lng: 37.6535,
    image: courseImages.jazzFunk,
    courses: ['Jazz Funk', 'Frame Up'],
  },
  {
    id: 'gracia',
    name: 'Грация',
    address: 'Новослободская ул. д18',
    metro: 'м. Новослободская',
    city: 'Москва',
    lat: 55.7791,
    lng: 37.6013,
    image: courseImages.ladyStyle,
    courses: ['Vogue', 'Lady Style'],
  },
  {
    id: 'spb-rhythm',
    name: 'Ритм',
    address: 'Невский пр. д40',
    metro: 'м. Гостиный двор',
    city: 'Санкт-Петербург',
    lat: 59.9343,
    lng: 30.3351,
    image: courseImages.hipHop,
    courses: ['Hip-Hop', 'Dancehall'],
  },
  {
    id: 'spb-move',
    name: 'Move Studio',
    address: 'Большой пр. П.С. д18',
    metro: 'м. Петроградская',
    city: 'Санкт-Петербург',
    lat: 59.9665,
    lng: 30.3117,
    image: courseImages.vogue,
    courses: ['Vogue', 'Waacking'],
  },
  {
    id: 'spb-stretch',
    name: 'Студия растяжки',
    address: 'Литейный пр. д26',
    metro: 'м. Чернышевская',
    city: 'Санкт-Петербург',
    lat: 59.9445,
    lng: 30.3497,
    image: courseImages.stretching,
    courses: ['Stretching', 'Contemporary'],
  },
  {
    id: 'kzn-dance-city',
    name: 'Dance City',
    address: 'ул. Баумана д36',
    metro: 'м. Кремлёвская',
    city: 'Казань',
    lat: 55.7887,
    lng: 49.1221,
    image: courseImages.jazzFunk,
    courses: ['Jazz Funk', 'High Heels'],
  },
  {
    id: 'kzn-energia',
    name: 'Энергия',
    address: 'ул. Пушкина д52',
    metro: 'м. Площадь Тукая',
    city: 'Казань',
    lat: 55.7848,
    lng: 49.1316,
    image: courseImages.frameUp,
    courses: ['Frame Up', 'Hip-Hop'],
  },
  {
    id: 'nsk-pulse',
    name: 'Pulse',
    address: 'Красный пр. д65',
    metro: 'м. Площадь Ленина',
    city: 'Новосибирск',
    lat: 55.0302,
    lng: 82.9204,
    image: courseImages.heelsChoreography,
    courses: ['High Heels', 'Lady Style'],
  },
  {
    id: 'ekb-freedom',
    name: 'Freedom Dance',
    address: 'ул. Ленина д24',
    metro: 'м. Площадь 1905 года',
    city: 'Екатеринбург',
    lat: 56.8389,
    lng: 60.5971,
    image: courseImages.afroDance,
    courses: ['Dancehall', 'Afro'],
  },
];

function uniqSorted(values: string[]): { value: string; label: string }[] {
  return Array.from(new Set(values))
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map((v) => ({ value: v, label: v }));
}

export const CITY_OPTIONS = uniqSorted(STUDIOS_MAP.map((st) => st.city));

export const METRO_OPTIONS = uniqSorted(STUDIOS_MAP.map((st) => st.metro));

const DEFAULT_METRO_CITY = 'Москва';

export function getMetroOptionsForCities(cities: string[]): { value: string; label: string }[] {
  const target = cities.length > 0 ? cities : [DEFAULT_METRO_CITY];

  return uniqSorted(STUDIOS_MAP.filter((st) => target.includes(st.city)).map((st) => st.metro));
}

export const STUDIO_OPTIONS = uniqSorted(STUDIOS_MAP.map((st) => st.name));

export const DANCE_TYPE_OPTIONS = uniqSorted(STUDIOS_MAP.flatMap((st) => st.courses));
