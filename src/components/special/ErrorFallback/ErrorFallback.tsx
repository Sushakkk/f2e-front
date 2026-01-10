import { captureException } from '@sentry/react';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useRouteError, useNavigate, useLocation } from 'react-router';

import { Button } from 'components/common';
import { RoutePath } from 'config/router/paths';
import { useRootStore } from 'store/globals/root';

// TODO: кастомизировать стили
import s from './ErrorFallback.module.scss';

const ErrorFallback: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const { reload } = useRootStore();

  const restart = React.useCallback(() => {
    navigate(RoutePath.root, { replace: true });
    reload();
  }, [navigate, reload]);

  React.useEffect(() => {
    captureException({
      error,
      context: {
        tags: {
          type: 'router',
          route: location.pathname,
        },
      },
    });
  }, [error, location.pathname]);

  return (
    <section className={s['error-page']}>
      <h2 className={s.title}>Произошла ошибка!</h2>
      <div className={s.text}>Перезагрузите сайт или попробуйте позже</div>
      <Button onClick={restart}>Перезагрузить</Button>
    </section>
  );
};

export default observer(ErrorFallback);
