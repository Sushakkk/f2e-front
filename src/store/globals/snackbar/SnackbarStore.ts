import { computed, makeObservable } from 'mobx';

import { DEFAULT_SNACKBAR_MESSAGES, SnackbarMessageType } from 'config/snackbars';
import { ValueModel } from 'store/models/ValueModel';

import { ISnackbarStore } from './declaration';

class SnackbarStore implements ISnackbarStore {
  readonly snackbarMessage: ValueModel<SnackbarMessageType | null> =
    new ValueModel<SnackbarMessageType | null>(null);

  constructor() {
    makeObservable(this, {
      isSnackbarOpen: computed,
    });
  }

  get isSnackbarOpen(): boolean {
    return this.snackbarMessage.value !== null;
  }

  openSnackbarMessage = (message?: SnackbarMessageType): void => {
    this.snackbarMessage.setValue(message ?? DEFAULT_SNACKBAR_MESSAGES.error);
  };

  triggerDefaultErrorMessage = (): void => {
    this.openSnackbarMessage(DEFAULT_SNACKBAR_MESSAGES.error);
  };

  triggerGetUserErrorMessage = (): void => {
    // TODO: заменить сообщение об ошибке, при необходимости
    this.openSnackbarMessage(DEFAULT_SNACKBAR_MESSAGES.error);
  };

  closeSnackbar = (): void => {
    this.snackbarMessage.setValue(null);
  };
}

export default SnackbarStore;
