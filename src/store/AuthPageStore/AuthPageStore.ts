import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import {
  AuthClient,
  BackendAuthResponse,
  normalizeAuthResponse,
  RegisterRequestServer,
} from 'entities/auth';
import { UserClient } from 'entities/user';
import { type IRootStore } from 'store/globals/root/declaration';
import { ILocalStore } from 'store/interfaces';
import { IApiRequest } from 'store/models/ApiRequest/declaration';

export type AuthSubmitResult = {
  success: boolean;
  user?: UserClient;
};

export type FormErrors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export class AuthPageStore implements ILocalStore {
  private readonly _rootStore: IRootStore;
  private readonly _requests: {
    login: IApiRequest<BackendAuthResponse>;
    register: IApiRequest<BackendAuthResponse>;
  };

  isLogin = true;
  name = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errors: FormErrors = {};
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  submitError: string | null = null;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;
    this._requests = {
      login: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.auth.login,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      register: this._rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.auth.register,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
    };

    makeObservable(this, {
      isLogin: observable,
      name: observable,
      username: observable,
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
      setUsername: action,
      setEmail: action,
      setPassword: action,
      setConfirmPassword: action,
      setIsLogin: action,
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

  setUsername = (value: string): void => {
    this.username = value;
    this._clearError('username');
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

  setIsLogin = (isLogin: boolean): void => {
    if (this.isLogin === isLogin) {
      return;
    }

    this.isLogin = isLogin;
    this.username = '';
    this.errors = {};
    this.submitError = null;
  };

  toggleMode = (): void => {
    this.setIsLogin(!this.isLogin);
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

    if (!this.isLogin && !this.username.trim()) {
      newErrors.username = 'Введите username';
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

  submit = async (): Promise<AuthSubmitResult | null> => {
    if (!this.validate()) {
      return null;
    }

    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = null;
    });

    const response = this.isLogin
      ? await this._requests.login.call({
          data: {
            email: this.email,
            password: this.password,
          },
        })
      : await this._requests.register.call({
          data: this._buildRegisterPayload(),
        });

    if (response.isError) {
      runInAction(() => {
        this.isSubmitting = false;
        this.submitError = this._extractErrorMessage(response.data);
      });

      return null;
    }

    const authData: AuthClient = normalizeAuthResponse(response.data);

    this._rootStore.apiStore.setAuthTokens({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
    });
    this._rootStore.userStore.login(authData.user);

    runInAction(() => {
      this.isSubmitting = false;
      this.submitError = null;
    });

    return {
      success: true,
      user: authData.user,
    };
  };

  private _clearError(field: keyof FormErrors): void {
    if (this.errors[field]) {
      const next = { ...this.errors };

      delete next[field];
      this.errors = next;
    }
  }

  private _buildRegisterPayload(): RegisterRequestServer {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    const fallbackName = this.email.split('@')[0] || 'user';

    return {
      email: this.email,
      username: this.username.trim() || fallbackName,
      first_name: parts[1] || parts[0] || fallbackName,
      middle_name: parts.slice(2).join(' '),
      last_name: parts[0] || fallbackName,
      phone: '',
      password: this.password,
      password_confirm: this.confirmPassword,
    };
  }

  private _extractErrorMessage(error?: unknown): string {
    const fallbackMessage = 'Что-то пошло не так. Повторите попытку.';

    if (!error) {
      return fallbackMessage;
    }

    if (typeof error === 'string') {
      return this._sanitizeErrorMessage(error, fallbackMessage);
    }

    if (typeof error === 'object') {
      const entries = Object.values(error as Record<string, unknown>);

      for (const value of entries) {
        if (typeof value === 'string') {
          return this._sanitizeErrorMessage(value, fallbackMessage);
        }

        if (Array.isArray(value) && typeof value[0] === 'string') {
          return this._sanitizeErrorMessage(value[0], fallbackMessage);
        }
      }
    }

    return fallbackMessage;
  }

  private _sanitizeErrorMessage(message: string, fallbackMessage: string): string {
    const normalized = message.trim();
    const lowerCased = normalized.toLowerCase();

    const looksInternal =
      lowerCased.includes('<!doctype') ||
      lowerCased.includes('<html') ||
      lowerCased.includes('traceback') ||
      lowerCased.includes('programmingerror') ||
      lowerCased.includes('internal server error') ||
      lowerCased.includes('column ') ||
      normalized.length > 180;

    if (looksInternal) {
      return fallbackMessage;
    }

    return normalized;
  }

  destroy(): void {}
}
