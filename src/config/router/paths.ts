export enum RoutePath {
  root = '/',
  error = '/error',
  auth = '/auth',
  authRegister = '/auth/register',
  survey = '/survey',
  home = '/',
  homeLegacy = '/home',
  course = '/course/:id',
  teacher = '/teacher/:id',
  calendar = '/calendar',
  map = '/map',

  /** Редирект на раздел по умолчанию, см. PROFILE_DEFAULT_PATH */
  profile = '/profile',

  /** Раздел профиля: `/profile/personal`, `/profile/enrollments`, … */
  profileSection = '/profile/:section',
}
