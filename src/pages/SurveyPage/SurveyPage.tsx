import cn from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowIcon from 'assets/images/arrow.svg?react';
import Button from 'components/common/Button/Button';
import { RoutePath } from 'config/router/paths';
import { SurveyPageStore } from 'store/SurveyPageStore';
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
import { buildHomeUrlWithFilters } from './utils';

const SurveyPage: React.FC = () => {
  const store = useLocalStore(() => new SurveyPageStore());
  const userStore = useUserStore();
  const navigate = useNavigate();

  const handleComplete = React.useCallback(() => {
    void userStore.flag('surveyCompleted', true);
    const url = buildHomeUrlWithFilters(store.filtersFromAnswers);

    navigate(url);
  }, [store, userStore, navigate]);

  const handleSkip = React.useCallback(() => {
    void userStore.flag('surveyCompleted', true);
    navigate(RoutePath.home);
  }, [userStore, navigate]);

  const renderStepContent = () => {
    const stepId = store.currentStep.id;

    switch (stepId) {
      case 'types':
        return (
          <div className={s.chips}>
            {SURVEY_DANCE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={cn(s.chip, store.answers.types.includes(type) && s.chipActive)}
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
          <div className={s.options}>
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                className={cn(s.option, store.answers.city === city && s.optionActive)}
                onClick={() => store.setCity(city)}
              >
                {city}
              </button>
            ))}
          </div>
        );

      case 'weekdays':
        return (
          <div className={s.chips}>
            {WEEKDAYS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={cn(s.chip, store.answers.weekdays.includes(value) && s.chipActive)}
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
          <div className={s.logo}>FiveToEight</div>
          <span className={s.headerSpacer} aria-hidden />
        </div>
        <h1 className={s.title}>Подберём занятия для вас</h1>
        <p className={s.subtitle}>Ответьте на несколько вопросов — мы покажем подходящие курсы</p>
        <div className={s.progress}>
          <div className={s.progressBar} style={{ width: `${store.progressPercent}%` }} />
        </div>
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
            <Button mode="purple" type="button" onClick={handleComplete} className={s.nextBtn}>
              Смотреть подборку
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
        <button type="button" className={s.skipLink} onClick={handleSkip}>
          Пропустить опрос
        </button>
      </div>
    </div>
  );
};

export default observer(SurveyPage);
