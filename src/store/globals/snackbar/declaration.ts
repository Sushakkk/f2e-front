import { SnackbarMessageType } from 'config/snackbars';
import { ValueModel } from 'store/models/ValueModel';

export interface ISnackbarStore {
  snackbarMessage: ValueModel<SnackbarMessageType | null>;

  isSnackbarOpen: boolean;

  openSnackbarMessage: (message?: SnackbarMessageType) => void;

  triggerDefaultErrorMessage: () => void;

  closeSnackbar: () => void;
}
