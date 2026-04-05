import { action, computed, makeObservable, observable } from 'mobx';

import { ENDPOINTS } from 'config/api';
import { BackendDanceStyle } from 'entities/danceStyle';
import { type IRootStore } from 'store/globals/root/declaration';
import { IApiRequest } from 'store/models/ApiRequest/declaration';

import { IDanceStylesStore } from './declaration';
import { normalizeDanceStyles, type DanceStyle } from './types';

export class DanceStylesStore implements IDanceStylesStore {
  private readonly _requests: {
    danceStyles: IApiRequest<BackendDanceStyle[]>;
  };

  private _requestPromise: Promise<DanceStyle[]> | null = null;

  styles: DanceStyle[] = [];
  isLoading = false;

  constructor(readonly rootStore: IRootStore) {
    this._requests = {
      danceStyles: this.rootStore.apiStore.createExtendedRequest({
        ...ENDPOINTS.dictionaries.danceStyles,
        showExpectedError: false,
        showUnexpectedError: false,
      }),
    };

    makeObservable(this, {
      styles: observable.ref,
      isLoading: observable,
      options: computed,
      requestDanceStyles: action,
    });
  }

  init = (): Promise<boolean> => Promise.resolve(true);

  get options(): { value: string; label: string }[] {
    return this.styles.map((style) => ({ value: style.name, label: style.name }));
  }

  requestDanceStyles = async (): Promise<DanceStyle[]> => {
    if (this.styles.length > 0) {
      return this.styles;
    }

    if (this._requestPromise) {
      return this._requestPromise;
    }

    this.isLoading = true;
    this._requestPromise = (async () => {
      const response = await this._requests.danceStyles.call();

      if (response.isError) {
        this.isLoading = false;
        this._requestPromise = null;

        return this.styles;
      }

      const styles = normalizeDanceStyles(response.data).sort((a, b) =>
        a.name.localeCompare(b.name, 'ru')
      );

      this.styles = styles;
      this.isLoading = false;
      this._requestPromise = null;

      return styles;
    })();

    return this._requestPromise;
  };

  destroy = (): void => {};
}
