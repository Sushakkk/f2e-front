import * as React from 'react';

import { Button } from 'components/common';
import { SelectDropdown } from 'components/common/SelectDropdown';
import { useDanceStylesStore } from 'store/hooks';

import {
  CITY_OPTIONS,
  STUDIO_OPTIONS,
  getMetroOptionsForCities,
  MapFilters as MapFiltersType,
} from '../../config';

import s from './MapFilters.module.scss';

type MapFiltersProps = {
  draft: MapFiltersType;
  onDraftChange: (patch: Partial<MapFiltersType>) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const MapFilters: React.FC<MapFiltersProps> = ({
  draft,
  onDraftChange,
  onApply,
  onReset,
  onClose,
}) => {
  const danceStylesStore = useDanceStylesStore();
  const metroOptions = React.useMemo(() => getMetroOptionsForCities(draft.cities), [draft.cities]);

  React.useEffect(() => {
    void danceStylesStore.requestDanceStyles();
  }, [danceStylesStore]);

  const handleCitiesChange = React.useCallback(
    (nextCities: string[]) => {
      const validMetro = getMetroOptionsForCities(nextCities);
      const validValues = new Set(validMetro.map((o) => o.value));
      const filteredMetro = draft.metro.filter((m) => validValues.has(m));

      onDraftChange({ cities: nextCities, metro: filteredMetro });
    },
    [draft.metro, onDraftChange]
  );

  return (
    <>
      <div className={s.overlay} onClick={onClose} />
      <div className={s.panel}>
        <div className={s.header}>
          <div className={s.title}>Фильтры</div>
          <button
            type="button"
            className={s.closeBtn}
            onClick={onClose}
            aria-label="Закрыть фильтры"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={s.body}>
          <div className={s.section}>
            <label className={s.label}>Город</label>
            <SelectDropdown
              mode="multi"
              value={draft.cities}
              placeholder="Выберите город"
              options={CITY_OPTIONS}
              onChange={handleCitiesChange}
              searchable
            />
          </div>
          <div className={s.section}>
            <label className={s.label}>Метро</label>
            <SelectDropdown
              mode="multi"
              value={draft.metro}
              placeholder="Выберите станцию метро"
              options={metroOptions}
              onChange={(v: string[]) => onDraftChange({ metro: v })}
              searchable
            />
          </div>
          <div className={s.section}>
            <label className={s.label}>Студия</label>
            <SelectDropdown
              mode="multi"
              value={draft.studios}
              placeholder="Выберите студию"
              options={STUDIO_OPTIONS}
              onChange={(v: string[]) => onDraftChange({ studios: v })}
              searchable
            />
          </div>
          <div className={s.section}>
            <label className={s.label}>Стиль танцев</label>
            <SelectDropdown
              mode="multi"
              value={draft.danceTypes}
              placeholder="Выберите стиль танцев"
              options={danceStylesStore.options}
              onChange={(v: string[]) => onDraftChange({ danceTypes: v })}
              searchable
            />
          </div>
        </div>
        <div className={s.actions}>
          <Button mode="dark" type="button" onClick={onReset}>
            Сбросить фильтры
          </Button>
          <Button mode="purple" type="button" onClick={onApply}>
            Применить фильтры
          </Button>
        </div>
      </div>
    </>
  );
};

export default React.memo(MapFilters);
