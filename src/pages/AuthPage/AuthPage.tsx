import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'components/common/Button/Button';
import { RoutePath } from 'config/router/paths';
import { AuthPageStore } from 'store/AuthPageStore';
import type { UserServer } from 'store/globals/user/types';
import { useLocalStore, useUserStore } from 'store/hooks';

import s from './AuthPage.module.scss';
import EyeClosed from './img/eye-closed.svg?react';
import EyeOpen from './img/eye-open.svg?react';

const AuthPage: React.FC = () => {
  const store = useLocalStore(() => new AuthPageStore());
  const userStore = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await store.submit();

      if (result?.success) {
        userStore.login(result.user as UserServer);
        navigate(RoutePath.home);
      }
    },
    [store, userStore, navigate]
  );

  return (
    <div className={s.page}>
      <div className={s.bg} />
      <div className={s.card}>
        <div className={s.logo}>FiveToEight</div>
        <h1 className={s.title}>{store.isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h1>
        <p className={s.subtitle}>
          {store.isLogin ? 'Войдите, чтобы записаться на курсы' : 'Создайте аккаунт, чтобы начать'}
        </p>
        <form className={s.form} onSubmit={(e) => void handleSubmit(e)}>
          {!store.isLogin && (
            <div className={s.field}>
              <label className={s.label}>ФИО</label>
              <input
                className={cn(s.input, store.errors.name && s.inputError)}
                type="text"
                placeholder="Иванов Иван Иванович"
                autoComplete="name"
                value={store.name}
                onChange={(e) => store.setName(e.target.value)}
              />
              {store.errors.name && <span className={s.error}>{store.errors.name}</span>}
            </div>
          )}
          <div className={s.field}>
            <label className={s.label}>Email</label>
            <input
              className={cn(s.input, store.errors.email && s.inputError)}
              type="email"
              placeholder="example@mail.com"
              autoComplete="email"
              value={store.email}
              onChange={(e) => store.setEmail(e.target.value)}
            />
            {store.errors.email && <span className={s.error}>{store.errors.email}</span>}
          </div>
          <div className={s.field}>
            <label className={s.label}>Пароль</label>
            <div className={s.inputWrapper}>
              <input
                className={cn(s.input, store.errors.password && s.inputError)}
                type={store.showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                autoComplete={store.isLogin ? 'current-password' : 'new-password'}
                value={store.password}
                onChange={(e) => store.setPassword(e.target.value)}
              />
              <button
                type="button"
                className={s.eyeBtn}
                onClick={store.toggleShowPassword}
                aria-label={store.showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {store.showPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
            {store.errors.password && <span className={s.error}>{store.errors.password}</span>}
          </div>
          {!store.isLogin && (
            <div className={s.field}>
              <label className={s.label}>Подтвердите пароль</label>
              <div className={s.inputWrapper}>
                <input
                  className={cn(s.input, store.errors.confirmPassword && s.inputError)}
                  type={store.showConfirmPassword ? 'text' : 'password'}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  value={store.confirmPassword}
                  onChange={(e) => store.setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={s.eyeBtn}
                  onClick={store.toggleShowConfirmPassword}
                  aria-label={store.showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {store.showConfirmPassword ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>
              {store.errors.confirmPassword && (
                <span className={s.error}>{store.errors.confirmPassword}</span>
              )}
            </div>
          )}
          {store.submitError && <div className={s.error}>{store.submitError}</div>}
          <Button mode="purple" className={s.submitBtn} type="submit" disabled={store.isSubmitting}>
            {store.isSubmitting ? 'Загрузка...' : store.isLogin ? 'Войти' : 'Создать аккаунт'}
          </Button>
        </form>
        <div className={s.footer}>
          {store.isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <span className={s.footerLink} onClick={store.toggleMode}>
            {store.isLogin ? 'Зарегистрироваться' : 'Войти'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default observer(AuthPage);
