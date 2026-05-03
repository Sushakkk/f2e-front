/**
 * Элемент расписания курса с API (детальная карточка).
 */
export type ScheduleEntryServer = {
  weekday: string;
  time_from: string;
  time_to: string;
  /** Текст локации (общий адрес или строка, собранная из студии). */
  location?: string | null;
  /** Название студии для строки (если у правила указан зал со студией). */
  studio?: string | null;
  /** Идентификатор студии строки (если есть зал). */
  studio_id?: number | null;
};

export type CourseDetailServer = {
  id: number;
  name: string;
  description: string;
  level: string;
  price: number;
  capacity: number;
  spots_left: number;
  date_from: string;
  date_to: string;
  /** Витрина: active | completed по датам (не путать с draft/published в БД). */
  status: string;
  images: string[];
  teacher_id?: number;
  teacher_name: string;
  dance_style: string;
  city: string;
  studio: string;
  schedule: ScheduleEntryServer[];
  music: {
    artist: string;
    track: string;
    url: string;
  };
};

export type CourseDetailResponseServer = CourseDetailServer;
