import * as React from 'react';

import { ErrorCodeEnum } from 'store/globals/api/types';

export type IconsPropsType = React.SVGProps<SVGSVGElement> & {
  fill?: string;
  width?: number;
  height?: number;
  getRootRef?: React.Ref<SVGSVGElement>;
  title?: string;
  deprecated?: boolean;
  replacement?: string;
};

export enum SnackbarMessageGoalsEnum {
  success = 'success',
  error = 'error',
  info = 'info',
}

/**
 * Тип содержит в себе текст (text) и цель (goal) сообщения. Если цели сообщения нет,
 * в снекбаре не будет отображена иконка перед текстом
 */
export type SnackbarMessageType = {
  text: React.ReactNode;
  goal?: SnackbarMessageGoalsEnum;
  duration?: number;
};

export const DEFAULT_SNACKBAR_MESSAGES = {
  error: {
    text: 'Произошла ошибка',
    goal: SnackbarMessageGoalsEnum.error,
  },
  success: {
    text: 'Действие успешно выполнено',
    goal: SnackbarMessageGoalsEnum.success,
  },
  info: {
    text: 'Что-то пошло не так',
    goal: SnackbarMessageGoalsEnum.info,
  },
};

export type SnackbarServerMessageList = Record<ErrorCodeEnum, SnackbarMessageType>;

export const COMMON_SERVER_ERROR_MESSAGES: SnackbarServerMessageList = {
  [ErrorCodeEnum.notAuthorized]: {
    text: 'Ошибка авторизации',
    goal: SnackbarMessageGoalsEnum.error,
  },
  [ErrorCodeEnum.internalError]: {
    text: 'Внутренняя ошибка',
    goal: SnackbarMessageGoalsEnum.error,
  },
};
