import { action, computed, makeObservable, observable } from 'mobx';

import { ILocalStore } from 'store/interfaces';

const DEFAULT_PER_PAGE = 6;

export class PaginationStore<T = unknown> implements ILocalStore {
  private _items: T[] = [];
  private _currentPage = 1;
  private _perPage: number;
  private _isFirstLoad = true;

  constructor(perPage = DEFAULT_PER_PAGE, initialPage?: number) {
    this._perPage = perPage;

    if (initialPage !== undefined && initialPage >= 1) {
      this._currentPage = initialPage;
    }

    makeObservable<this, '_items' | '_currentPage' | '_perPage'>(this, {
      _items: observable.ref,
      _currentPage: observable,
      _perPage: observable,
      currentPage: computed,
      totalPages: computed,
      visiblePages: computed,
      paginatedItems: computed,
      totalItems: computed,
      isEmpty: computed,
      setItems: action,
      setPage: action,
      setPerPage: action,
      reset: action,
    });
  }

  get currentPage(): number {
    return this._currentPage;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this._items.length / this._perPage));
  }

  get visiblePages(): (number | '...')[] {
    const current = this._currentPage;
    const total = this.totalPages;

    if (total <= 7) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);

    return pages;
  }

  get totalItems(): number {
    return this._items.length;
  }

  get isEmpty(): boolean {
    return this._items.length === 0;
  }

  get paginatedItems(): T[] {
    const start = (this._currentPage - 1) * this._perPage;

    return this._items.slice(start, start + this._perPage);
  }

  setItems(items: T[]): void {
    const prevLength = this._items.length;

    this._items = items;

    if (this._isFirstLoad) {
      if (items.length === 0) {
        return;
      }

      this._isFirstLoad = false;

      if (this._currentPage > this.totalPages) {
        this._currentPage = this.totalPages;
      }
    } else if (items.length !== prevLength) {
      this._currentPage = 1;
    }
  }

  setPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.totalPages);

    this._currentPage = clamped;
  }

  setPerPage(perPage: number): void {
    if (this._perPage === perPage) {
      return;
    }

    this._perPage = perPage;
    this._currentPage = 1;
  }

  reset(): void {
    this._currentPage = 1;
  }

  destroy(): void {
    // no-op
  }
}
