import type { FontFormatExt } from './types';

export const FONT_FORMAT: Record<FontFormatExt, string> = {
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
  eot: 'embedded-opentype',
  otc: 'collection',
  ttc: 'collection',
};
