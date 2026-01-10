export interface IAppParamsStore {
  readonly apiUrl: string;
  readonly isDev: boolean;
  readonly isProd: boolean;

  isMobile: boolean;
}
