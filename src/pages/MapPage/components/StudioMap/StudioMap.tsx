import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps';
import * as React from 'react';

import {
  DEFAULT_ZOOM,
  MARKER_ACTIVE_ICON,
  MARKER_ICON,
  RUSSIA_CENTER,
  StudioData,
} from '../../config';

import s from './StudioMap.module.scss';

type StudioMapProps = {
  studios: StudioData[];
  selectedId: string | null;
  onMarkerClick: (studio: StudioData) => void;
  mapRef: (ref: ymaps.Map | null) => void;
};

const StudioMap: React.FC<StudioMapProps> = ({
  studios,
  selectedId,
  onMarkerClick,
  mapRef,
}) => (
  <YMaps query={{ lang: 'ru_RU' }}>
    <Map
      defaultState={{ center: RUSSIA_CENTER, zoom: DEFAULT_ZOOM }}
      className={s.map}
      instanceRef={mapRef}
      options={{ suppressMapOpenBlock: true }}
    >
      {studios.map((studio) => (
        <Placemark
          key={studio.id}
          geometry={[studio.lat, studio.lng]}
          options={{
            iconLayout: 'default#image',
            iconImageHref: selectedId === studio.id ? MARKER_ACTIVE_ICON : MARKER_ICON,
            iconImageSize: selectedId === studio.id ? [28, 36] : [20, 26],
            iconImageOffset: selectedId === studio.id ? [-14, -36] : [-10, -26],
          }}
          onClick={() => onMarkerClick(studio)}
        />
      ))}
    </Map>
  </YMaps>
);

function arePropsEqual(prev: StudioMapProps, next: StudioMapProps): boolean {
  if (prev.selectedId !== next.selectedId) {
    return false;
  }

  if (prev.studios.length !== next.studios.length) {
    return false;
  }

  for (let i = 0; i < prev.studios.length; i++) {
    if (prev.studios[i].id !== next.studios[i].id) {
      return false;
    }
  }

  return true;
}

export default React.memo(StudioMap, arePropsEqual);
