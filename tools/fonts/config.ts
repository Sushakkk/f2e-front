import type { FontProps } from './types';

export const FONTS: FontProps[] = [
  {
    name: 'SF Pro Display',
    genericFamily: 'sans-serif',
    basePath: '/static/fonts/SFProDisplay',
    variants: [
      {
        fileNamePostfix: '-Regular',
        weight: 400,
      },
      {
        fileNamePostfix: '-Medium',
        weight: 500,
      },
      {
        fileNamePostfix: '-Semibold',
        weight: 600,
      },
      {
        fileNamePostfix: '-Bold',
        weight: 700,
      },
    ],
    formats: ['woff2'],
    display: 'swap',
  },
  {
    name: 'VK Sans Display',
    genericFamily: 'sans-serif',
    basePath: 'https://public-data.hb.bizmrg.com/fonts/VKSansDisplay/VKSansDisplay',
    variants: [
      {
        fileNamePostfix: '-Light',
        weight: 300,
      },
      {
        fileNamePostfix: '-Regular',
        weight: 400,
      },
      {
        fileNamePostfix: '-Medium',
        weight: 500,
      },
      {
        fileNamePostfix: '-DemiBold',
        weight: 600,
      },
      {
        fileNamePostfix: '-Bold',
        weight: 700,
      },
    ],
    formats: ['woff2'],
    display: 'swap',
  },
];
