import type { DanceStyle } from './client';
import type { BackendDanceStyle } from './server';

export const normalizeDanceStyle = (data: BackendDanceStyle): DanceStyle => ({
  id: data.id,
  name: data.name,
  slug: data.slug,
});

export const normalizeDanceStyles = (data: BackendDanceStyle[]): DanceStyle[] =>
  data.map(normalizeDanceStyle);
