export type FontProps = {
  basePath: string;
  formats: FontFormatExt[];
  variants: FontVariant[];
} & FontFaceProps &
  FontFamilyProps;

export type FontFormatExt = 'woff2' | 'woff' | 'ttf' | 'otf' | 'eot' | 'otc' | 'ttc';

export type FontFaceProps = {
  name: string;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
};

export type FontVariant = {
  fileNamePostfix: string;
  weight?: number;
  style?: 'normal' | 'italic' | 'oblique';
};

export type FontFamilyProps = {
  genericFamily:
    | 'serif'
    | 'sans-serif'
    | 'monospace'
    | 'cursive'
    | 'fantasy'
    | 'system-ui'
    | 'ui-serif'
    | 'ui-sans-serif'
    | 'ui-monospace'
    | 'ui-rounded'
    | 'emoji'
    | 'math'
    | 'fangsong';
};
