import { observer } from 'mobx-react';
import * as React from 'react';

import { ScreenSpinner } from 'components/common';
import { SearchBar } from 'pages/HomePage/components';
import { useDebouncedValue } from 'utils/useDebouncedValue';

import s from './MapPage.module.scss';
import { MapFilters, StudioCard, StudioMap, ZoomControls } from './components';
import {
  DEFAULT_ZOOM,
  EMPTY_FILTERS,
  RUSSIA_CENTER,
  STUDIOS_MAP,
  StudioData,
  MapFilters as MapFiltersType,
} from './config';

const MapPage: React.FC = () => {
  const [selectedStudio, setSelectedStudio] = React.useState<StudioData | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);
  const [filters, setFilters] = React.useState<MapFiltersType>(EMPTY_FILTERS);
  const [draft, setDraft] = React.useState<MapFiltersType>(EMPTY_FILTERS);
  const mapRef = React.useRef<ymaps.Map | null>(null);

  const handleMapLoad = React.useCallback(() => setIsMapLoaded(true), []);

  const handleMarkerClick = React.useCallback((studio: StudioData) => {
    setSelectedStudio(studio);
    setIsFiltersOpen(false);
    void mapRef.current?.setCenter([studio.lat, studio.lng], 15, { duration: 400 });
  }, []);

  const handleCloseCard = React.useCallback(() => {
    setSelectedStudio(null);
    void mapRef.current?.setCenter(RUSSIA_CENTER, DEFAULT_ZOOM, { duration: 400 });
  }, []);

  const handleZoomIn = React.useCallback(() => {
    const map = mapRef.current;

    if (map) {
      void map.setZoom(map.getZoom() + 1, { duration: 200 });
    }
  }, []);

  const handleZoomOut = React.useCallback(() => {
    const map = mapRef.current;

    if (map) {
      void map.setZoom(map.getZoom() - 1, { duration: 200 });
    }
  }, []);

  const handleToggleFilters = React.useCallback(() => {
    setIsFiltersOpen((v) => {
      if (!v) {
        setDraft((prev) => ({ ...prev }));
      }

      return !v;
    });
  }, []);

  const handleCloseFilters = React.useCallback(() => setIsFiltersOpen(false), []);

  const handleDraftChange = React.useCallback((patch: Partial<MapFiltersType>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const fitBounds = React.useCallback((studios: StudioData[]) => {
    const map = mapRef.current;

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
  }, []);

  const handleApply = React.useCallback(() => {
    setFilters(draft);
    setIsFiltersOpen(false);
    setSelectedStudio(null);

    let result = STUDIOS_MAP;

    if (draft.cities.length > 0) {
      result = result.filter((st) => draft.cities.includes(st.city));
    }

    if (draft.metro.length > 0) {
      result = result.filter((st) => draft.metro.includes(st.metro));
    }

    if (draft.studios.length > 0) {
      result = result.filter((st) => draft.studios.includes(st.name));
    }

    if (draft.danceTypes.length > 0) {
      result = result.filter((st) => st.courses.some((c) => draft.danceTypes.includes(c)));
    }

    if (result.length > 0 && result.length < STUDIOS_MAP.length) {
      requestAnimationFrame(() => fitBounds(result));
    }
  }, [draft, fitBounds]);

  const handleReset = React.useCallback(() => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setIsFiltersOpen(false);
    void mapRef.current?.setCenter(RUSSIA_CENTER, DEFAULT_ZOOM, { duration: 400 });
  }, []);

  const filteredStudios = React.useMemo(() => {
    let result = STUDIOS_MAP;

    if (filters.cities.length > 0) {
      result = result.filter((st) => filters.cities.includes(st.city));
    }

    if (filters.metro.length > 0) {
      result = result.filter((st) => filters.metro.includes(st.metro));
    }

    if (filters.studios.length > 0) {
      result = result.filter((st) => filters.studios.includes(st.name));
    }

    if (filters.danceTypes.length > 0) {
      result = result.filter((st) => st.courses.some((c) => filters.danceTypes.includes(c)));
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();

      result = result.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.address.toLowerCase().includes(q) ||
          st.metro.toLowerCase().includes(q)
      );
    }

    return result;
  }, [debouncedSearch, filters]);

  React.useEffect(() => {
    if (!isMapLoaded) {
      return;
    }

    if (debouncedSearch.trim()) {
      if (filteredStudios.length > 0) {
        fitBounds(filteredStudios);
      }
    } else {
      const hasFilters = Object.values(filters).some((arr) => arr.length > 0);

      if (!hasFilters) {
        void mapRef.current?.setCenter(RUSSIA_CENTER, DEFAULT_ZOOM, { duration: 400 });
      }
    }
  }, [debouncedSearch, filteredStudios, fitBounds, isMapLoaded, filters]);

  return (
    <div className={s.page}>
      {!isMapLoaded && <ScreenSpinner />}
      <div className={s.mapWrapper}>
        <StudioMap
          studios={filteredStudios}
          selectedId={selectedStudio?.id ?? null}
          onMarkerClick={handleMarkerClick}
          mapRef={mapRef}
          onLoad={handleMapLoad}
        />
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </div>
      {selectedStudio && <StudioCard studio={selectedStudio} onClose={handleCloseCard} />}
      {!selectedStudio && (
        <div className={s.bottomPanel}>
          <SearchBar
            className={s.searchBar}
            value={searchQuery}
            onChange={setSearchQuery}
            onToggleFilters={handleToggleFilters}
            isFiltersOpen={isFiltersOpen}
            filtersAlwaysVisible
          />
        </div>
      )}
      {isFiltersOpen && (
        <MapFilters
          draft={draft}
          onDraftChange={handleDraftChange}
          onApply={handleApply}
          onReset={handleReset}
          onClose={handleCloseFilters}
        />
      )}
    </div>
  );
};

export default observer(MapPage);
