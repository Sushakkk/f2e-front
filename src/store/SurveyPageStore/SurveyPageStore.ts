import { action, computed, makeObservable, observable } from 'mobx';

import type { CourseLevel } from 'config/levels';
import type { CoursesFiltersValue } from 'pages/HomePage/components/Filters/types';
import {
  BUDGET_OPTIONS,
  DEFAULT_SURVEY_ANSWERS,
  LEVELS_ORDER,
  SURVEY_STEPS,
  SurveyAnswers,
} from 'pages/SurveyPage/config';
import { ILocalStore } from 'store/interfaces';

export class SurveyPageStore implements ILocalStore {
  answers: SurveyAnswers = { ...DEFAULT_SURVEY_ANSWERS };
  currentStepIndex = 0;

  constructor() {
    makeObservable(this, {
      answers: observable,
      currentStepIndex: observable,

      currentStep: computed,
      isFirstStep: computed,
      isLastStep: computed,
      progressPercent: computed,
      filtersFromAnswers: computed,

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
      reset: action,
    });
  }

  get currentStep(): (typeof SURVEY_STEPS)[number] {
    return SURVEY_STEPS[this.currentStepIndex] ?? SURVEY_STEPS[0];
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

  toggleType(type: string): void {
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

  reset(): void {
    this.answers = { ...DEFAULT_SURVEY_ANSWERS };
    this.currentStepIndex = 0;
  }

  destroy(): void {}
}
