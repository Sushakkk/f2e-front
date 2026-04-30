import fallbackImage from 'assets/images/courses/five-to-eight-placeholder.png';
import { STUDIOS_MAP, type StudioData } from 'pages/MapPage/config';

import type { MapPointServer } from './server';

function normalizeCoordinate(value: string | number | null, fallback: number): number {
  if (value === null || value === '') {
    return fallback;
  }

  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : fallback;
}

export function normalizeMapPoint(data: MapPointServer): StudioData {
  const fallbackStudio = STUDIOS_MAP.find(
    (studio) => studio.name === data.name && studio.city === data.city
  );

  return {
    id: String(data.id),
    name: data.name,
    address: data.address,
    metro: data.metro,
    city: data.city,
    lat: normalizeCoordinate(data.lat, fallbackStudio?.lat ?? 0),
    lng: normalizeCoordinate(data.lng, fallbackStudio?.lng ?? 0),
    image: data.image || fallbackStudio?.image || fallbackImage,
    courses: data.dance_styles ?? [],
  };
}

export function normalizeMapPoints(
  data: MapPointServer[],
  options: { keepWithoutCoordinates?: boolean } = {}
): StudioData[] {
  const studios = data.map(normalizeMapPoint);

  if (options.keepWithoutCoordinates) {
    return studios;
  }

  return studios.filter((studio) => studio.lat !== 0 && studio.lng !== 0);
}
