import { observer } from 'mobx-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { ScreenSpinner } from 'components/common';
import { RoutePath } from 'config/router/paths';
import { SearchBar } from 'pages/HomePage/components';
import type { StudioData } from 'pages/MapPage/config';
import { MapPageStore } from 'store/MapPageStore';
import { useRootStore } from 'store/globals/root';
import { useLocalStore } from 'store/hooks';

import s from './MapPage.module.scss';
import { MapFilters, StudioCard, StudioMap } from './components';

const MapPage: React.FC = () => {
  const rootStore = useRootStore();
  const store = useLocalStore(() => new MapPageStore(rootStore));
  const navigate = useNavigate();

  const handleInstanceRef = React.useCallback(
    (ref: ymaps.Map | null) => {
      store.setMapRef(ref);
    },
    [store]
  );

  React.useEffect(() => {
    void store.loadFilterOptions();
    void store.loadStudios();
  }, [store]);

  const handleGoToStudioCourses = React.useCallback(
    (studio: StudioData) => {
      const params = new URLSearchParams();

      params.set('studios', studio.name);
      navigate({
        pathname: RoutePath.home,
        search: params.toString(),
      });
    },
    [navigate]
  );

  return (
    <div className={s.page}>
      {!store.isMapLoaded && <ScreenSpinner />}
      <button
        type="button"
        className={s.geoButton}
        onClick={() => store.focusUserLocation()}
        disabled={!store.userLocation}
        aria-label="Вернуться к геолокации"
        title="Вернуться к геолокации"
      >
        <span className={s.geoIcon} aria-hidden="true">
          ➤
        </span>
      </button>
      <div className={s.mapWrapper}>
        <StudioMap
          studios={store.filteredStudios}
          selectedId={store.selectedStudio?.id ?? null}
          userLocation={store.userLocation}
          onMarkerClick={store.selectStudio}
          mapRef={handleInstanceRef}
        />
      </div>
      {store.selectedStudio && (
        <StudioCard
          studio={store.selectedStudio}
          onClose={store.closeCard}
          onClick={handleGoToStudioCourses}
        />
      )}
      {!store.selectedStudio && (
        <div className={s.bottomPanel}>
          <div className={s.bottomInner}>
            <SearchBar
              className={s.searchBar}
              value={store.searchQuery}
              onChange={store.setSearchQuery}
              onToggleFilters={store.toggleFilters}
              isFiltersOpen={store.isFiltersOpen}
              filtersAlwaysVisible
            />
          </div>
        </div>
      )}
      {store.isFiltersOpen && (
        <MapFilters
          draft={store.draft}
          cityOptions={store.cityOptions}
          getMetroOptionsForCities={store.getMetroOptionsForCities}
          getStudioOptionsForCities={store.getStudioOptionsForCities}
          onDraftChange={store.setDraft}
          onApply={store.applyFilters}
          onReset={store.resetFilters}
          onClose={store.closeFilters}
        />
      )}
    </div>
  );
};

export default observer(MapPage);
