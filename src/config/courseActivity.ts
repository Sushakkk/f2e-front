/**
 * Статус курса на витрине (по датам окончания), совпадает с полем status в API списка/деталки.
 * По умолчанию активен; после date_to — завершён.
 */
export enum CourseActivityStatus {
  Active = 'active',
  Completed = 'completed',
}

const LABEL_RU: Record<CourseActivityStatus, string> = {
  [CourseActivityStatus.Active]: 'Активен',
  [CourseActivityStatus.Completed]: 'Завершён',
};

export function parseCourseActivityStatus(raw: string | undefined): CourseActivityStatus {
  return raw === CourseActivityStatus.Completed
    ? CourseActivityStatus.Completed
    : CourseActivityStatus.Active;
}

export function courseActivityStatusLabelRu(status: CourseActivityStatus): string {
  return LABEL_RU[status];
}
