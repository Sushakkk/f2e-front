import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowIcon from 'assets/images/arrow.svg?react';
import { CloseIconButton, SelectDropdown } from 'components/common';
import Button from 'components/common/Button/Button';
import { RoutePath } from 'config/router/paths';
import { SurveyPageStore } from 'store/SurveyPageStore';
import { useRootStore } from 'store/globals/root';
import { useLocalStore, useUserStore } from 'store/hooks';

import s from './SurveyPage.module.scss';
import {
  BUDGET_OPTIONS,
  CITIES,
  LEVELS_ORDER,
  SURVEY_DANCE_TYPES,
  SURVEY_STEPS,
  TIME_PREFERENCES,
  WEEKDAYS,
} from './config';

const SurveyPage: React.FC = () => {
  const rootStore = useRootStore();
  const store = useLocalStore(() => new SurveyPageStore(rootStore));
  const userStore = useUserStore();
  const navigate = useNavigate();

  const handleComplete = React.useCallback(async () => {
    const isSuccess = await store.syncSurveyToBackend();

    if (!isSuccess) {
      return;
    }

    const user = await userStore.requestUser();

    if (!user) {
      void userStore.flag('surveyCompleted', true);
    }

    navigate(RoutePath.home);
  }, [store, userStore, navigate]);

  const handleClose = React.useCallback(() => {
    navigate(RoutePath.home);
  }, [navigate]);

  const cityOptions = React.useMemo(() => CITIES.map((city) => ({ value: city, label: city })), []);
  const isAllTypesSelected = store.answers.types.length === SURVEY_DANCE_TYPES.length;
  const isAnyDaySelected = store.answers.weekdays.length === WEEKDAYS.length;

  const renderStepContent = () => {
    const stepId = store.currentStep.id;

    switch (stepId) {
      case 'role':
        return (
          <div className={s.options}>
            <button
              type="button"
              className={cn(s.option, store.answers.role === 'student' && s.optionActive)}
              onClick={() => store.setRole('student')}
            >
              Ученик
            </button>
            <button
              type="button"
              className={cn(s.option, store.answers.role === 'teacher' && s.optionActive)}
              onClick={() => store.setRole('teacher')}
            >
              Преподаватель
            </button>
          </div>
        );

      case 'types':
        return (
          <div className={s.chips}>
            <button
              type="button"
              className={cn(
                s.chip,
                store.answers.types.length === SURVEY_DANCE_TYPES.length && s.chipActive
              )}
              onClick={() => store.setTypes([...SURVEY_DANCE_TYPES])}
            >
              Все
            </button>
            {SURVEY_DANCE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={cn(
                  s.chip,
                  !isAllTypesSelected && store.answers.types.includes(type) && s.chipActive
                )}
                onClick={() => store.toggleType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        );

      case 'level':
        return (
          <div className={s.options}>
            {LEVELS_ORDER.map((level) => (
              <button
                key={level}
                type="button"
                className={cn(s.option, store.answers.level === level && s.optionActive)}
                onClick={() => store.setLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        );

      case 'city':
        return (
          <div className={s.selectWrap}>
            <SelectDropdown
              options={cityOptions}
              value={store.answers.city}
              onChange={(value) => store.setCity(value)}
              placeholder="Выберите город"
              searchable
            />
          </div>
        );

      case 'weekdays':
        return (
          <div className={s.chips}>
            <button
              type="button"
              className={cn(
                s.chip,
                store.answers.weekdays.length === WEEKDAYS.length && s.chipActive
              )}
              onClick={() => store.setWeekdays(WEEKDAYS.map((day) => day.value))}
            >
              Любой день
            </button>
            {WEEKDAYS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={cn(
                  s.chip,
                  !isAnyDaySelected && store.answers.weekdays.includes(value) && s.chipActive
                )}
                onClick={() => store.toggleWeekday(value)}
              >
                {label}
              </button>
            ))}
          </div>
        );

      case 'time':
        return (
          <div className={s.options}>
            <button
              type="button"
              className={cn(s.option, store.answers.timeFrom === '' && s.optionActive)}
              onClick={() => store.setTimeFrom('')}
            >
              Любое время
            </button>
            {TIME_PREFERENCES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={cn(s.option, store.answers.timeFrom === value && s.optionActive)}
                onClick={() => store.setTimeFrom(value)}
              >
                {label}
              </button>
            ))}
          </div>
        );

      case 'budget':
        return (
          <div className={s.options}>
            <button
              type="button"
              className={cn(
                s.option,
                store.answers.priceFrom === undefined &&
                  store.answers.priceTo === undefined &&
                  s.optionActive
              )}
              onClick={() => store.setBudget(null)}
            >
              Не важно
            </button>
            {BUDGET_OPTIONS.map((opt) => {
              const isActive =
                store.answers.priceFrom === opt.priceFrom && store.answers.priceTo === opt.priceTo;

              return (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(s.option, isActive && s.optionActive)}
                  onClick={() => store.setBudget(opt)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={s.page}>
      <div className={s.bg} />
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.headerSide}>
            {store.isFirstStep ? (
              <span className={s.headerSpacer} aria-hidden />
            ) : (
              <button
                type="button"
                className={s.backArrow}
                onClick={() => store.prevStep()}
                aria-label="Назад"
              >
                <ArrowIcon />
              </button>
            )}
          </div>
          <div className={s.headerSide}>
            <CloseIconButton
              className={s.closeBtn}
              iconClassName={s.closeIcon}
              onClick={handleClose}
              ariaLabel="Закрыть опрос"
            />
          </div>
        </div>
        <div className={s.content}>
          <div className={s.logo}>FiveToEight</div>
          <h1 className={s.title}>Подберём занятия для вас</h1>
          <p className={s.subtitle}>Ответьте на несколько вопросов — мы покажем подходящие курсы</p>
          <div className={s.stepIndicator}>
            {SURVEY_STEPS.map((step, i) => (
              <button
                key={step.id}
                type="button"
                className={cn(
                  s.stepDot,
                  i === store.currentStepIndex && s.stepDotActive,
                  i < store.currentStepIndex && s.stepDotDone
                )}
                onClick={() => store.goToStep(i)}
                aria-label={`Шаг ${i + 1}`}
              />
            ))}
          </div>
          <div className={s.stepContent}>
            <h2 className={s.stepTitle}>{store.currentStep.title}</h2>
            {store.currentStep.subtitle && (
              <p className={s.stepSubtitle}>{store.currentStep.subtitle}</p>
            )}
            {renderStepContent()}
          </div>
          <div className={s.actions}>
            {store.isLastStep ? (
              <Button
                mode="purple"
                type="button"
                onClick={() => {
                  void handleComplete();
                }}
                className={s.nextBtn}
              >
                Отправить
              </Button>
            ) : (
              <Button
                mode="purple"
                type="button"
                onClick={() => store.nextStep()}
                className={s.nextBtn}
              >
                Далее
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(SurveyPage);
