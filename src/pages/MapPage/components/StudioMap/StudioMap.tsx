import { Map, Placemark, YMaps, ZoomControl } from '@pbe/react-yandex-maps';
import * as React from 'react';

import {
  MARKER_ACTIVE_ICON,
  MARKER_ICON,
  MOSCOW_CENTER,
  MOSCOW_ZOOM,
  StudioData,
} from '../../config';

import s from './StudioMap.module.scss';

type StudioMapProps = {
  studios: StudioData[];
  selectedId: string | null;
  onMarkerClick: (studio: StudioData) => void;
  mapRef: (ref: ymaps.Map | null) => void;
};

const StudioMap: React.FC<StudioMapProps> = ({ studios, selectedId, onMarkerClick, mapRef }) => (
  <YMaps query={{ lang: 'ru_RU' }}>
    <Map
      defaultState={{ center: MOSCOW_CENTER, zoom: MOSCOW_ZOOM }}
      className={s.map}
      instanceRef={mapRef}
      options={{ suppressMapOpenBlock: true }}
    >
      <ZoomControl options={{ position: { right: 16, top: 80 } }} />
      {studios.map((studio) => (
        <Placemark
          key={studio.id}
          geometry={[studio.lat, studio.lng]}
          options={{
            iconLayout: 'default#image',
            iconImageHref: selectedId === studio.id ? MARKER_ACTIVE_ICON : MARKER_ICON,
            iconImageSize: selectedId === studio.id ? [28, 36] : [20, 26],
            iconImageOffset: selectedId === studio.id ? [-14, -36] : [-10, -26],
            cursor: 'pointer',
          }}
          onClick={() => onMarkerClick(studio)}
        />
      ))}
    </Map>
  </YMaps>
);

export default React.memo(StudioMap);
