import {
  action,
  computed,
  IReactionDisposer,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';

import {
  DEFAULT_FILTERS,
  MapFilters,
  MOSCOW_CENTER,
  MOSCOW_ZOOM,
  STUDIOS_MAP,
  StudioData,
} from 'pages/MapPage/config';
import { ILocalStore } from 'store/interfaces';

const SEARCH_DEBOUNCE_MS = 300;
const MAP_LOAD_TIMEOUT_MS = 5_000;

export class MapPageStore implements ILocalStore {
  selectedStudio: StudioData | null = null;
  searchQuery = '';
  isFiltersOpen = false;
  isMapLoaded = false;
  filters: MapFilters = DEFAULT_FILTERS;
  draft: MapFilters = DEFAULT_FILTERS;

  private _debouncedSearch = '';
  private _mapRef: ymaps.Map | null = null;
  private _disposers: IReactionDisposer[] = [];
  private _loadTimer: number | null = null;

  constructor() {
    makeObservable<this, '_debouncedSearch'>(this, {
      selectedStudio: observable.ref,
      searchQuery: observable,
      isFiltersOpen: observable,
      isMapLoaded: observable,
      filters: observable.ref,
      draft: observable.ref,
      _debouncedSearch: observable,

      filteredStudios: computed,

      setSearchQuery: action,
      setMapLoaded: action,
      selectStudio: action,
      closeCard: action,
      toggleFilters: action,
      closeFilters: action,
      setDraft: action,
      applyFilters: action,
      resetFilters: action,
    });

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
    let result = STUDIOS_MAP;

    if (this.filters.cities.length > 0) {
      result = result.filter((st) => this.filters.cities.includes(st.city));
    }

    if (this.filters.metro.length > 0) {
      result = result.filter((st) => this.filters.metro.includes(st.metro));
    }

    if (this.filters.studios.length > 0) {
      result = result.filter((st) => this.filters.studios.includes(st.name));
    }

    if (this.filters.danceTypes.length > 0) {
      result = result.filter((st) => st.courses.some((c) => this.filters.danceTypes.includes(c)));
    }

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

    let result = STUDIOS_MAP;

    if (this.draft.cities.length > 0) {
      result = result.filter((st) => this.draft.cities.includes(st.city));
    }

    if (this.draft.metro.length > 0) {
      result = result.filter((st) => this.draft.metro.includes(st.metro));
    }

    if (this.draft.studios.length > 0) {
      result = result.filter((st) => this.draft.studios.includes(st.name));
    }

    if (this.draft.danceTypes.length > 0) {
      result = result.filter((st) => st.courses.some((c) => this.draft.danceTypes.includes(c)));
    }

    if (result.length > 0 && result.length < STUDIOS_MAP.length) {
      requestAnimationFrame(() => this._fitBounds(result));
    }
  };

  resetFilters = (): void => {
    this.draft = DEFAULT_FILTERS;
    this.filters = DEFAULT_FILTERS;
    this.isFiltersOpen = false;
    void this._mapRef?.setCenter(MOSCOW_CENTER, MOSCOW_ZOOM, { duration: 400 });
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
