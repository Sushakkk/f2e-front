import {
  action,
  computed,
  IReactionDisposer,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';

import { ENDPOINTS } from 'config/api';
import { normalizeMapPoints, type MapPointsResponseServer } from 'entities/mapPoint';
import {
  DEFAULT_FILTERS,
  EMPTY_FILTERS,
  MapFilters,
  MOSCOW_CENTER,
  MOSCOW_ZOOM,
  StudioData,
} from 'pages/MapPage/config';
import type { ErrorResponse } from 'store/globals/api/types';
import type { IRootStore } from 'store/globals/root/declaration';
import { ILocalStore } from 'store/interfaces';

const SEARCH_DEBOUNCE_MS = 300;
const MAP_LOAD_TIMEOUT_MS = 5_000;

type SelectOption = { value: string; label: string };
type PrivateFields = '_debouncedSearch' | '_studios' | '_allStudios' | '_isLoading' | '_loadError';

function uniqSortedOptions(values: string[]): SelectOption[] {
  return Array.from(new Set(values.filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map((value) => ({ value, label: value }));
}

function buildMapQueryParams(filters: MapFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.cities.length > 0) {
    params.city = filters.cities.join(',');
  }

  if (filters.metro.length > 0) {
    params.metro = filters.metro.join(',');
  }

  if (filters.studios.length > 0) {
    params.studio = filters.studios.join(',');
  }

  if (filters.danceTypes.length > 0) {
    params.style = filters.danceTypes.join(',');
  }

  return params;
}

function resolveDefaultCity(city: string | null | undefined): string {
  return city && city.trim() ? city.trim() : 'Москва';
}

function buildDefaultFilters(city: string): MapFilters {
  return {
    ...EMPTY_FILTERS,
    cities: [city],
  };
}

export class MapPageStore implements ILocalStore {
  selectedStudio: StudioData | null = null;
  searchQuery = '';
  isFiltersOpen = false;
  isMapLoaded = false;
  filters: MapFilters = DEFAULT_FILTERS;
  draft: MapFilters = DEFAULT_FILTERS;

  private _studios: StudioData[] = [];
  private _allStudios: StudioData[] = [];
  private _isLoading = false;
  private _loadError = false;
  private _debouncedSearch = '';
  private _mapRef: ymaps.Map | null = null;
  private _disposers: IReactionDisposer[] = [];
  private _loadTimer: number | null = null;
  private _loadRequestId = 0;
  private _defaultCity: string;

  constructor(private _rootStore: IRootStore) {
    this._defaultCity = resolveDefaultCity(this._rootStore.userStore.user?.city);
    this.filters = buildDefaultFilters(this._defaultCity);
    this.draft = buildDefaultFilters(this._defaultCity);

    makeObservable<this, PrivateFields>(this, {
      selectedStudio: observable.ref,
      searchQuery: observable,
      isFiltersOpen: observable,
      isMapLoaded: observable,
      filters: observable.ref,
      draft: observable.ref,
      _studios: observable.ref,
      _allStudios: observable.ref,
      _isLoading: observable,
      _loadError: observable,
      _debouncedSearch: observable,

      filteredStudios: computed,
      isLoading: computed,
      loadError: computed,
      cityOptions: computed,

      setSearchQuery: action,
      setMapLoaded: action,
      selectStudio: action,
      closeCard: action,
      toggleFilters: action,
      closeFilters: action,
      setDraft: action,
      applyFilters: action,
      resetFilters: action,
      loadStudios: action.bound,
      loadFilterOptions: action.bound,
    });

    this._disposers.push(
      reaction(
        () => this._rootStore.userStore.user?.city ?? null,
        (city) => {
          const nextDefaultCity = resolveDefaultCity(city);

          if (nextDefaultCity === this._defaultCity) {
            return;
          }

          const shouldSyncFilters =
            this.filters.cities.length === 0 ||
            (this.filters.cities.length === 1 && this.filters.cities[0] === this._defaultCity);
          const shouldSyncDraft =
            this.draft.cities.length === 0 ||
            (this.draft.cities.length === 1 && this.draft.cities[0] === this._defaultCity);

          this._defaultCity = nextDefaultCity;

          if (shouldSyncFilters) {
            this.filters = buildDefaultFilters(nextDefaultCity);
            void this.loadStudios();
          }

          if (shouldSyncDraft) {
            this.draft = buildDefaultFilters(nextDefaultCity);
          }
        }
      )
    );

    this._disposers.push(
      reaction(
        () => this.searchQuery,
        (query) => {
          const id = window.setTimeout(() => {
            runInAction(() => {
              this._debouncedSearch = query;
            });
          }, SEARCH_DEBOUNCE_MS);

          return () => window.clearTimeout(id);
        },
        { fireImmediately: false }
      )
    );

    this._disposers.push(
      reaction(
        () => ({ search: this._debouncedSearch, studios: this.filteredStudios }),
        ({ search, studios }) => {
          if (!this.isMapLoaded) {
            return;
          }

          if (search.trim()) {
            if (studios.length > 0) {
              this._fitBounds(studios);
            }
          } else {
            this._fitToFilters();
          }
        }
      )
    );

    this._startLoadTimeout();
  }

  get filteredStudios(): StudioData[] {
    let result = this._studios;

    if (this._debouncedSearch.trim()) {
      const q = this._debouncedSearch.toLowerCase();

      result = result.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.address.toLowerCase().includes(q) ||
          st.metro.toLowerCase().includes(q)
      );
    }

    return result;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get loadError(): boolean {
    return this._loadError;
  }

  get cityOptions(): SelectOption[] {
    return uniqSortedOptions(this._allStudios.map((studio) => studio.city));
  }

  getMetroOptionsForCities = (cities: string[]): SelectOption[] => {
    const source =
      cities.length > 0
        ? this._allStudios.filter((studio) => cities.includes(studio.city))
        : this._allStudios;

    return uniqSortedOptions(source.map((studio) => studio.metro));
  };

  getStudioOptionsForCities = (cities: string[]): SelectOption[] => {
    const source =
      cities.length > 0
        ? this._allStudios.filter((studio) => cities.includes(studio.city))
        : this._allStudios;

    return uniqSortedOptions(source.map((studio) => studio.name));
  };

  setMapRef = (ref: ymaps.Map | null): void => {
    this._mapRef = ref;

    if (ref) {
      this.setMapLoaded();
    }
  };

  setSearchQuery = (value: string): void => {
    this.searchQuery = value;
  };

  setMapLoaded = (): void => {
    if (this.isMapLoaded) {
      return;
    }

    this.isMapLoaded = true;
    this._clearLoadTimeout();
    this._fitToFilters();
  };

  selectStudio = (studio: StudioData): void => {
    this.selectedStudio = studio;
    this.isFiltersOpen = false;
    void this._mapRef?.setCenter([studio.lat, studio.lng], 15, { duration: 400 });
  };

  closeCard = (): void => {
    this.selectedStudio = null;
    this._fitToFilters();
  };

  toggleFilters = (): void => {
    if (!this.isFiltersOpen) {
      this.draft = { ...this.draft };
    }

    this.isFiltersOpen = !this.isFiltersOpen;
  };

  closeFilters = (): void => {
    this.isFiltersOpen = false;
  };

  setDraft = (patch: Partial<MapFilters>): void => {
    this.draft = { ...this.draft, ...patch };
  };

  applyFilters = (): void => {
    this.filters = this.draft;
    this.isFiltersOpen = false;
    this.selectedStudio = null;
    void this.loadStudios();
  };

  resetFilters = (): void => {
    this.draft = buildDefaultFilters(this._defaultCity);
    this.filters = buildDefaultFilters(this._defaultCity);
    this.isFiltersOpen = false;
    this.selectedStudio = null;
    void this.loadStudios();
  };

  loadFilterOptions = async (): Promise<void> => {
    const response = await this._rootStore.apiStore
      .createExtendedRequest<MapPointsResponseServer, ErrorResponse>({
        ...ENDPOINTS.map.points,
        showExpectedError: false,
        showUnexpectedError: false,
      })
      .call();

    if (response.isError) {
      return;
    }

    runInAction(() => {
      this._allStudios = normalizeMapPoints(response.data, { keepWithoutCoordinates: true });
    });
  };

  loadStudios = async (): Promise<void> => {
    const requestId = this._loadRequestId + 1;

    this._loadRequestId = requestId;
    this._isLoading = true;
    this._loadError = false;

    const response = await this._rootStore.apiStore
      .createExtendedRequest<MapPointsResponseServer, ErrorResponse>({
        ...ENDPOINTS.map.points,
        showExpectedError: false,
        showUnexpectedError: true,
      })
      .call({ params: buildMapQueryParams(this.filters) });

    runInAction(() => {
      if (requestId !== this._loadRequestId) {
        return;
      }

      this._isLoading = false;

      if (response.isError) {
        if (!response.isCancelled) {
          this._loadError = true;
          this._studios = [];
        }

        return;
      }

      this._studios = normalizeMapPoints(response.data);

      if (this._allStudios.length === 0) {
        this._allStudios = this._studios;
      }

      requestAnimationFrame(() => this._fitToFilters());
    });
  };

  zoomIn = (): void => {
    if (this._mapRef) {
      void this._mapRef.setZoom(this._mapRef.getZoom() + 1, { duration: 200 });
    }
  };

  zoomOut = (): void => {
    if (this._mapRef) {
      void this._mapRef.setZoom(this._mapRef.getZoom() - 1, { duration: 200 });
    }
  };

  destroy(): void {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    this._clearLoadTimeout();
  }

  private _fitToFilters(): void {
    const studios = this.filteredStudios;

    if (studios.length > 0) {
      this._fitBounds(studios);
    } else {
      void this._mapRef?.setCenter(MOSCOW_CENTER, MOSCOW_ZOOM, { duration: 400 });
    }
  }

  private _fitBounds(studios: StudioData[]): void {
    const map = this._mapRef;

    if (!map || studios.length === 0) {
      return;
    }

    if (studios.length === 1) {
      void map.setCenter([studios[0].lat, studios[0].lng], 14, { duration: 400 });

      return;
    }

    const lats = studios.map((st) => st.lat);
    const lngs = studios.map((st) => st.lng);

    void map.setBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { checkZoomRange: true, duration: 400, zoomMargin: [60, 60, 60, 60] }
    );
  }

  private _startLoadTimeout(): void {
    this._loadTimer = window.setTimeout(() => {
      runInAction(() => {
        this.isMapLoaded = true;
      });
    }, MAP_LOAD_TIMEOUT_MS);
  }

  private _clearLoadTimeout(): void {
    if (this._loadTimer !== null) {
      window.clearTimeout(this._loadTimer);
      this._loadTimer = null;
    }
  }
}
