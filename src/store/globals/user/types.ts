export type ApiAuth = {
  user: string;
  token: string;
};

export type UserFlags = Record<string, boolean>;

export type SexType = 0 | 1 | 2; // 0 - пол не указан, 1 - женский пол, 2 - мужской пол

// TODO: заменить тип пользователя на используемый в проекте
export type UserServer = {
  id: number;
  first_name?: string;
  last_name?: string;
  sex?: SexType;
  bdate?: string;
  country_id?: number;
  city_id?: number;
  flags?: UserFlags;
};

export type ApiGetUserType<UserT = UserServer> = {
  user: UserT;
};

export type ApiAuthType<UserT = UserServer> = ApiGetUserType<UserT> & {
  messages_allowed?: boolean;
};

export type FlagParamsType = {
  name: string;
  value: boolean;
  withLoadingCheck?: boolean;
};
