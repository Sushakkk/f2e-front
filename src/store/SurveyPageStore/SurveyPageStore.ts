import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import type { CourseLevel } from 'config/levels';
import type { CityServer } from 'entities/city';
import { buildSurveySubmitPayload } from 'entities/survey';
import type { UserClient } from 'entities/user';
import type { CoursesFiltersValue } from 'pages/HomePage/components/Filters/types';
import {
  BUDGET_OPTIONS,
  DEFAULT_SURVEY_ANSWERS,
  LEVELS_ORDER,
  SURVEY_STEPS,
  SurveyAnswers,
} from 'pages/SurveyPage/config';
import { ErrorResponse } from 'store/globals/api/types';
import { type IRootStore } from 'store/globals/root/declaration';
import { ILocalStore } from 'store/interfaces';
import { IApiRequest } from 'store/models/ApiRequest/declaration';

export class SurveyPageStore implements ILocalStore {
  private readonly _rootStore: IRootStore;
  private readonly _requests: {
    survey: IApiRequest<unknown, ErrorResponse>;
    updateUser: IApiRequest<unknown, ErrorResponse>;
    cities: IApiRequest<CityServer[], ErrorResponse>;
  };

  answers: SurveyAnswers = { ...DEFAULT_SURVEY_ANSWERS };
  cities: CityServer[] = [];
  currentStepIndex = 0;
  isSubmitting = false;
  submitError = false;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;
    this._requests = {
      survey: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.auth.userSurvey,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      updateUser: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.auth.updateUser,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      cities: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.dictionaries.cities,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
    };

    makeObservable(this, {
      answers: observable,
      cities: observable.ref,
      currentStepIndex: observable,
      isSubmitting: observable,
      submitError: observable,

      currentStep: computed,
      cityOptions: computed,
      danceTypeOptions: computed,
      isFirstStep: computed,
      isLastStep: computed,
      progressPercent: computed,
      filtersFromAnswers: computed,

      setRole: action,
      setTypes: action,
      toggleType: action,
      setLevel: action,
      setCity: action,
      setWeekdays: action,
      toggleWeekday: action,
      setTimeFrom: action,
      setBudget: action,
      nextStep: action,
      prevStep: action,
      goToStep: action,
      skipCurrentStep: action,
      initializeFromUser: action,
      loadDictionaries: action,
      markSurveyCompleted: action,
      syncSurveyToBackend: action,
      reset: action,
    });
  }

  get currentStep(): (typeof SURVEY_STEPS)[number] {
    return SURVEY_STEPS[this.currentStepIndex] ?? SURVEY_STEPS[0];
  }

  get cityOptions(): { value: string; label: string }[] {
    return this.cities.map((city) => ({ value: city.name, label: city.name }));
  }

  get danceTypeOptions(): string[] {
    return this._rootStore.danceStylesStore.styles.map((style) => style.name);
  }

  get isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === SURVEY_STEPS.length - 1;
  }

  get progressPercent(): number {
    return ((this.currentStepIndex + 1) / SURVEY_STEPS.length) * 100;
  }

  get filtersFromAnswers(): CoursesFiltersValue {
    const { types, level, city, weekdays, timeFrom, priceFrom, priceTo } = this.answers;

    const timeTo: string | undefined =
      timeFrom === '09:00'
        ? '12:00'
        : timeFrom === '12:00'
          ? '18:00'
          : timeFrom === '18:00'
            ? '23:59'
            : undefined;

    const effectiveLevel =
      level && level !== 'Любой уровень' && LEVELS_ORDER.includes(level) ? [level] : [];

    return {
      types: types.length ? types : [],
      levels: effectiveLevel,
      cities: city ? [city] : undefined,
      weekdays: weekdays.length ? weekdays : undefined,
      timeFrom: timeFrom || undefined,
      timeTo,
      priceFrom,
      priceTo,
    };
  }

  setTypes(types: string[]): void {
    this.answers = { ...this.answers, types };
  }

  setRole(role: SurveyAnswers['role']): void {
    this.answers = { ...this.answers, role };
  }

  toggleType(type: string): void {
    const isAllTypesSelected = this.answers.types.length === this.danceTypeOptions.length;

    if (isAllTypesSelected) {
      this.answers = { ...this.answers, types: [type] };

      return;
    }

    const next = new Set(this.answers.types);

    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }

    this.answers = { ...this.answers, types: Array.from(next) };
  }

  setLevel(level: CourseLevel | ''): void {
    this.answers = { ...this.answers, level };
  }

  setCity(city: string): void {
    this.answers = { ...this.answers, city };
  }

  setWeekdays(weekdays: string[]): void {
    this.answers = { ...this.answers, weekdays };
  }

  toggleWeekday(day: string): void {
    const isAnyDaySelected =
      this.answers.weekdays.length === DEFAULT_SURVEY_ANSWERS.weekdays.length;

    if (isAnyDaySelected) {
      this.answers = { ...this.answers, weekdays: [day] };

      return;
    }

    const next = new Set(this.answers.weekdays);

    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }

    this.answers = { ...this.answers, weekdays: Array.from(next) };
  }

  setTimeFrom(timeFrom: string): void {
    this.answers = { ...this.answers, timeFrom };
  }

  setBudget(option: (typeof BUDGET_OPTIONS)[number] | null): void {
    if (!option) {
      this.answers = { ...this.answers, priceFrom: undefined, priceTo: undefined };

      return;
    }

    this.answers = {
      ...this.answers,
      priceFrom: option.priceFrom,
      priceTo: option.priceTo,
    };
  }

  nextStep(): void {
    if (this.currentStepIndex < SURVEY_STEPS.length - 1) {
      this.currentStepIndex += 1;
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex -= 1;
    }
  }

  goToStep(index: number): void {
    const clamped = Math.max(0, Math.min(index, SURVEY_STEPS.length - 1));

    this.currentStepIndex = clamped;
  }

  skipCurrentStep(): void {
    switch (this.currentStep.id) {
      case 'role':
        this.answers = { ...this.answers, role: DEFAULT_SURVEY_ANSWERS.role };
        break;
      case 'types':
        this.answers = { ...this.answers, types: [...DEFAULT_SURVEY_ANSWERS.types] };
        break;
      case 'level':
        this.answers = { ...this.answers, level: 'Любой уровень' };
        break;
      case 'city':
        this.answers = { ...this.answers, city: '' };
        break;
      case 'weekdays':
        this.answers = {
          ...this.answers,
          weekdays: [...DEFAULT_SURVEY_ANSWERS.weekdays],
        };
        break;
      case 'time':
        this.answers = { ...this.answers, timeFrom: '' };
        break;
      case 'budget':
        this.answers = {
          ...this.answers,
          priceFrom: undefined,
          priceTo: undefined,
        };
        break;
      default:
        break;
    }

    if (!this.isLastStep) {
      this.nextStep();
    }
  }

  reset(): void {
    this.answers = { ...DEFAULT_SURVEY_ANSWERS };
    this.currentStepIndex = 0;
    this.isSubmitting = false;
    this.submitError = false;
  }

  initializeFromUser(user: UserClient | null): void {
    if (!user) {
      this.answers = { ...DEFAULT_SURVEY_ANSWERS };
      this.currentStepIndex = 0;
      return;
    }

    const normalizeBudgetValue = (value: string | number | null | undefined): number | undefined => {
      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : undefined;
      }

      return undefined;
    };

    this.answers = {
      role: user.role ?? DEFAULT_SURVEY_ANSWERS.role,
      types:
        user.preferredDanceStyles && user.preferredDanceStyles.length > 0
          ? [...user.preferredDanceStyles]
          : [...DEFAULT_SURVEY_ANSWERS.types],
      level:
        user.level && LEVELS_ORDER.includes(user.level as CourseLevel)
          ? (user.level as CourseLevel)
          : DEFAULT_SURVEY_ANSWERS.level,
      city: user.city ?? '',
      weekdays:
        user.preferredWeekdays && user.preferredWeekdays.length > 0
          ? [...user.preferredWeekdays]
          : [...DEFAULT_SURVEY_ANSWERS.weekdays],
      timeFrom: user.preferredTimeFrom ?? '',
      priceFrom: normalizeBudgetValue(user.priceFrom),
      priceTo: normalizeBudgetValue(user.priceTo),
    };
    this.currentStepIndex = 0;
    this.submitError = false;
  }

  loadDictionaries = async (): Promise<void> => {
    const [citiesResponse, danceStyles] = await Promise.all([
      this._requests.cities.call(),
      this._rootStore.danceStylesStore.requestDanceStyles(),
    ]);

    if (!citiesResponse.isError) {
      runInAction(() => {
        this.cities = citiesResponse.data;
      });
    }

    if (
      danceStyles.length > 0 &&
      (this.answers.types.length === 0 ||
        this.answers.types.every((type) => DEFAULT_SURVEY_ANSWERS.types.includes(type)))
    ) {
      runInAction(() => {
        this.answers = {
          ...this.answers,
          types: [...danceStyles.map((style) => style.name)],
        };
      });
    }
  };

  destroy(): void {}

  markSurveyCompleted = async (): Promise<boolean> => {
    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = false;
    });

    const response = await this._requests.updateUser.call({
      data: {
        survey_completed: true,
      },
    });

    runInAction(() => {
      this.isSubmitting = false;
      this.submitError = response.isError;
    });

    return !response.isError;
  };

  syncSurveyToBackend = async (): Promise<boolean> => {
    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = false;
    });

    const surveyPayload = buildSurveySubmitPayload({
      role: this.answers.role,
      city: this.answers.city,
      level: this.answers.level,
      types: this.answers.types,
      weekdays: this.answers.weekdays,
      timeFrom: this.answers.timeFrom,
      priceFrom: this.answers.priceFrom,
      priceTo: this.answers.priceTo,
    });
    const response = await this._requests.survey.call({
      data: surveyPayload,
    });

    runInAction(() => {
      this.isSubmitting = false;
      this.submitError = response.isError;
    });

    return !response.isError;
  };
}
