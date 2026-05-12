import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { ENDPOINTS } from 'config/api';
import { normalizeRecommendation, type RecommendationClient, type RecommendationServer } from 'entities/recommendation';
import type { ErrorResponse } from 'store/globals/api/types';
import type { IRootStore } from 'store/globals/root/declaration';
import type { ILocalStore } from 'store/interfaces/ILocalStore';

type PrivateFields = '_items' | '_isLoading' | '_loadError' | '_hasLoadedOnce';

export class RecommendationsStore implements ILocalStore {
  private readonly _rootStore: IRootStore;

  private _items: RecommendationClient[] = [];
  private _isLoading = false;
  private _loadError = false;
  private _hasLoadedOnce = false;

  constructor(rootStore: IRootStore) {
    this._rootStore = rootStore;

    makeObservable<this, PrivateFields>(this, {
      _items: observable.ref,
      _isLoading: observable,
      _loadError: observable,
      _hasLoadedOnce: observable,
      items: computed,
      isLoading: computed,
      loadError: computed,
      hasLoadedOnce: computed,
      loadRecommendations: action.bound,
      clear: action.bound,
      destroy: action.bound,
    });
  }

  get items(): RecommendationClient[] {
    return this._items;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get loadError(): boolean {
    return this._loadError;
  }

  get hasLoadedOnce(): boolean {
    return this._hasLoadedOnce;
  }

  loadRecommendations = async (limit = 12): Promise<void> => {
    if (this._isLoading) {
      return;
    }

    const user = this._rootStore.userStore.user;
    if (!user) {
      this.clear();
      return;
    }

    this._isLoading = true;
    this._loadError = false;

    const request = this._rootStore.apiStore.createExtendedRequest<RecommendationServer[], ErrorResponse>({
      ...ENDPOINTS.recommendations.list,
      showExpectedError: false,
      showUnexpectedError: false,
    });
    const response = await request.call({
      params: {
        limit: String(limit),
      },
    });

    runInAction(() => {
      this._isLoading = false;
      this._hasLoadedOnce = true;

      if (response.isError) {
        this._loadError = true;
        this._items = [];
        return;
      }

      this._items = response.data.map(normalizeRecommendation);
    });
  };

  clear(): void {
    this._items = [];
    this._isLoading = false;
    this._loadError = false;
    this._hasLoadedOnce = false;
  }

  destroy(): void {
    this.clear();
  }
}
