import { init } from '@sentry/react';

import { IAppParamsStore } from 'store/globals/appParams/declaration';

export const initSentry = ({ isProd, isDev }: IAppParamsStore) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  init({
    dsn: process.env.SENTRY_DSN,
    environment: isProd ? 'production' : isDev ? 'development' : 'unknown',
    normalizeDepth: 6,
  });
};
