import { FONTS } from './config';
import { getFontPreloadLinksBuilder, getFontFaceCSSBuilder, FontBuilderProps } from './utils';

export const buildFontsInject = (
  params: FontBuilderProps = {}
): {
  INJECT_FONTS_PRELOAD_LINKS: string;
  INJECT_FONTS_FACES: string;
} => {
  const buildFontFace = getFontFaceCSSBuilder(params);
  const buildPreloadLinks = getFontPreloadLinksBuilder({ ...params, preloadFormats: ['woff2'] });

  const INJECT_FONTS_PRELOAD_LINKS = FONTS.map(buildPreloadLinks).join('\n');

  const INJECT_FONTS_FACES = FONTS.map(buildFontFace).join('\n');

  return {
    INJECT_FONTS_PRELOAD_LINKS,
    INJECT_FONTS_FACES,
  };
};
