import { observer } from 'mobx-react';
import * as React from 'react';

import { ScreenSpinner } from 'components/common';
import { SearchBar } from 'pages/HomePage/components';
import { MapPageStore } from 'store/MapPageStore';
import { useLocalStore } from 'store/hooks';

import s from './MapPage.module.scss';
import { MapFilters, StudioCard, StudioMap, ZoomControls } from './components';

const MapPage: React.FC = () => {
  const store = useLocalStore(() => new MapPageStore());

  const handleInstanceRef = React.useCallback(
    (ref: ymaps.Map | null) => {
      store.setMapRef(ref);
    },
    [store]
  );

  return (
    <div className={s.page}>
      {!store.isMapLoaded && <ScreenSpinner />}
      <div className={s.mapWrapper}>
        <StudioMap
          studios={store.filteredStudios}
          selectedId={store.selectedStudio?.id ?? null}
          onMarkerClick={store.selectStudio}
          mapRef={handleInstanceRef}
        />
        <ZoomControls onZoomIn={store.zoomIn} onZoomOut={store.zoomOut} />
      </div>
      {store.selectedStudio && (
        <StudioCard studio={store.selectedStudio} onClose={store.closeCard} />
      )}
      {!store.selectedStudio && (
        <div className={s.bottomPanel}>
          <SearchBar
            className={s.searchBar}
            value={store.searchQuery}
            onChange={store.setSearchQuery}
            onToggleFilters={store.toggleFilters}
            isFiltersOpen={store.isFiltersOpen}
            filtersAlwaysVisible
          />
        </div>
      )}
      {store.isFiltersOpen && (
        <MapFilters
          draft={store.draft}
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
