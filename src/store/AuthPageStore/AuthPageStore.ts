import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { MockDb, type MockAuthResult } from 'services/mockDb';
import { ILocalStore } from 'store/interfaces';

export type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export class AuthPageStore implements ILocalStore {
  isLogin = true;
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errors: FormErrors = {};
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  submitError: string | null = null;

  constructor() {
    makeObservable(this, {
      isLogin: observable,
      name: observable,
      email: observable,
      password: observable,
      confirmPassword: observable,
      errors: observable,
      showPassword: observable,
      showConfirmPassword: observable,
      isSubmitting: observable,
      submitError: observable,

      hasErrors: computed,

      setName: action,
      setEmail: action,
      setPassword: action,
      setConfirmPassword: action,
      toggleMode: action,
      toggleShowPassword: action,
      toggleShowConfirmPassword: action,
      clearError: action,
      validate: action,
      submit: action,
    });
  }

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  setName = (value: string): void => {
    this.name = value;
    this._clearError('name');
  };

  setEmail = (value: string): void => {
    this.email = value;
    this._clearError('email');

    if (this.submitError) {
      this.submitError = null;
    }
  };

  setPassword = (value: string): void => {
    this.password = value;
    this._clearError('password');

    if (this.submitError) {
      this.submitError = null;
    }
  };

  setConfirmPassword = (value: string): void => {
    this.confirmPassword = value;
    this._clearError('confirmPassword');
  };

  toggleMode = (): void => {
    this.isLogin = !this.isLogin;
    this.errors = {};
    this.submitError = null;
  };

  toggleShowPassword = (): void => {
    this.showPassword = !this.showPassword;
  };

  toggleShowConfirmPassword = (): void => {
    this.showConfirmPassword = !this.showConfirmPassword;
  };

  clearError = (field: keyof FormErrors): void => {
    this._clearError(field);
  };

  validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!this.isLogin && !this.name.trim()) {
      newErrors.name = 'Введите ФИО';
    }

    if (!this.email.trim()) {
      newErrors.email = 'Введите email';
    }

    if (!this.password) {
      newErrors.password = 'Введите пароль';
    }

    if (!this.isLogin && !this.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (!this.isLogin && this.password !== this.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    this.errors = newErrors;

    return Object.keys(newErrors).length === 0;
  };

  submit = async (): Promise<MockAuthResult | null> => {
    if (!this.validate()) {
      return null;
    }

    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = null;
    });

    let result: MockAuthResult;

    if (this.isLogin) {
      result = await MockDb.login(this.email, this.password);
    } else {
      const parts = this.name.trim().split(/\s+/);

      result = await MockDb.register({
        lastName: parts[0] || '',
        firstName: parts[1] || parts[0] || '',
        email: this.email,
        password: this.password,
      });
    }

    runInAction(() => {
      this.isSubmitting = false;

      if (!result.success) {
        this.submitError = result.error;
      }
    });

    return result;
  };

  private _clearError(field: keyof FormErrors): void {
    if (this.errors[field]) {
      const next = { ...this.errors };

      delete next[field];
      this.errors = next;
    }
  }

  destroy(): void {}
}
