import { action, computed, makeObservable, observable } from 'mobx';

import { ENDPOINTS } from 'config/api';
import {
  normalizeNotification,
  type NotificationClient,
  type NotificationServer,
} from 'entities/notification';
import { ErrorResponse } from 'store/globals/api/types';
import { type IRootStore } from 'store/globals/root/declaration';
import { IApiRequest } from 'store/models/ApiRequest/declaration';

import { INotificationsStore } from './declaration';

export class NotificationsStore implements INotificationsStore {
  private readonly _requests: {
    list: IApiRequest<NotificationServer[]>;
    readAll: IApiRequest<{ marked: number }>;
    deleteOne: IApiRequest<void>;
  };

  items: NotificationClient[] = [];
  isLoading = false;

  constructor(readonly rootStore: IRootStore) {
    this._requests = {
      list: this.rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.notifications.list,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      readAll: this.rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.notifications.readAll,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
      deleteOne: this.rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.notifications.detail(0, 'DELETE'),
        showExpectedError: false,
        showUnexpectedError: false,
      }),
    };

    makeObservable(this, {
      items: observable.ref,
      isLoading: observable,
      unreadCount: computed,
      init: action.bound,
      load: action.bound,
      markRead: action.bound,
      markAllRead: action.bound,
      deleteNotification: action.bound,
      clear: action.bound,
    });
  }

  init = (): Promise<boolean> => Promise.resolve(true);

  get unreadCount(): number {
    return this.items.filter((item) => !item.readAt).length;
  }

  clear = (): void => {
    this.items = [];
  };

  load = async (): Promise<void> => {
    if (!this.rootStore.userStore.user) {
      this.items = [];

      return;
    }

    this.isLoading = true;
    const response = await this._requests.list.call();
    this.isLoading = false;

    if (response.isError || !Array.isArray(response.data)) {
      return;
    }

    this.items = response.data.map(normalizeNotification);
  };

  markRead = async (id: number): Promise<void> => {
    const response = await this.rootStore.apiStore
      .createExtendedRequest<NotificationServer, ErrorResponse>({
        ...ENDPOINTS.notifications.detail(id, 'PATCH'),
        showExpectedError: false,
        showUnexpectedError: false,
      })
      .call({ data: { read: true } });

    if (response.isError) {
      return;
    }

    const normalized = normalizeNotification(response.data);
    this.items = this.items.map((item) => (item.id === id ? normalized : item));
  };

  markAllRead = async (): Promise<void> => {
    const response = await this._requests.readAll.call();

    if (response.isError) {
      return;
    }

    await this.load();
  };

  deleteNotification = async (id: number): Promise<void> => {
    const response = await this._requests.deleteOne.call({
      url: ENDPOINTS.notifications.detail(id, 'DELETE').url,
    });

    if (response.isError) {
      return;
    }

    this.items = this.items.filter((item) => item.id !== id);
  };

  destroy = (): void => {
    this._requests.list.cancel();
    this._requests.readAll.cancel();
    this._requests.deleteOne.cancel();
  };
}
