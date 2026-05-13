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
  userLocation: [number, number] | null;
  onMarkerClick: (studio: StudioData) => void;
  mapRef: (ref: ymaps.Map | null) => void;
};

const USER_LOCATION_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="26" viewBox="0 0 20 26"><path d="M10 0C4.477 0 0 4.477 0 10c0 6.75 9 15.45 9.4 15.85a.85.85 0 001.2 0C11 25.45 20 16.75 20 10 20 4.477 15.523 0 10 0z" fill="#E5484D"/><circle cx="10" cy="10" r="3.5" fill="white"/></svg>'
  );

const StudioMap: React.FC<StudioMapProps> = ({
  studios,
  selectedId,
  userLocation,
  onMarkerClick,
  mapRef,
}) => (
  <YMaps query={{ lang: 'ru_RU' }}>
    <Map
      defaultState={{ center: MOSCOW_CENTER, zoom: MOSCOW_ZOOM }}
      className={s.map}
      instanceRef={mapRef}
      options={{ suppressMapOpenBlock: true }}
    >
      <ZoomControl options={{ position: { right: 16, top: 80 } }} />
      {userLocation && (
        <Placemark
          geometry={userLocation}
          options={{
            iconLayout: 'default#image',
            iconImageHref: USER_LOCATION_ICON,
            iconImageSize: [20, 26],
            iconImageOffset: [-10, -26],
          }}
        />
      )}
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
