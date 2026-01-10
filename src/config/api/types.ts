export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type EndpointType = {
  url: string;
  method?: ApiMethod;
  headers?: Record<string, string>;
};
