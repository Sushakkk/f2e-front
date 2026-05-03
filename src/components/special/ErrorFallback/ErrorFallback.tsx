import { captureException } from '@sentry/react';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Link, useLocation, useNavigate, useRouteError } from 'react-router-dom';

import WarningCircleIcon from 'assets/icons/warning-circle.svg?react';
import { Button } from 'components/common';
import { RoutePath } from 'config/router/paths';
import { useRootStore } from 'store/globals/root';

import s from './ErrorFallback.module.scss';

const ErrorFallback: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const { reload } = useRootStore();

  const goHome = React.useCallback(() => {
    navigate(RoutePath.home, { replace: true });
    reload();
  }, [navigate, reload]);

  const hardReload = React.useCallback(() => {
    window.location.reload();
  }, []);

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
    <div className={s.root}>
      <header className={s.root__top}>
        <Link className={s.root__brand} to={RoutePath.home}>
          FiveToEight
        </Link>
      </header>
      <main className={s.root__main}>
        <div className={s.root__card}>
          <div className={s.root__iconWrap}>
            <WarningCircleIcon className={s.root__icon} />
          </div>
          <h1 className={s.root__title}>Что-то пошло не так</h1>
          <p className={s.root__text}>Попробуйте вернуться на главную или обновить страницу.</p>
          <div className={s.root__actions}>
            <Button mode="purple" type="button" className={s.root__btn} onClick={goHome}>
              На главную
            </Button>
            <Button mode="purpleDashed" type="button" className={s.root__btn} onClick={hardReload}>
              Обновить страницу
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default observer(ErrorFallback);
