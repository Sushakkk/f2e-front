import { type HTMLMotionProps } from 'framer-motion';

export const APP_LOADER_PAGE_ANIMATION_PROPS: HTMLMotionProps<'div'> = {
  initial: {
    opacity: 0,
    position: 'fixed',
    pointerEvents: 'none',
  },
  animate: {
    opacity: 1,
    position: 'initial',
    pointerEvents: 'initial',
  },
  exit: {
    opacity: 0,
    position: 'fixed',
    pointerEvents: 'none',
  },
  transition: {
    duration: 0.25,
  },
};

export const FULL_PAGE_ANIMATION_PROPS: HTMLMotionProps<'div'> = {
  initial: {
    opacity: 0,
    x: '100%',
    position: 'fixed',
    pointerEvents: 'none',
  },
  animate: {
    opacity: 1,
    x: 0,
    position: 'initial',
    pointerEvents: 'initial',
  },
  exit: {
    opacity: 0,
    x: '-100%',
    position: 'fixed',
    pointerEvents: 'none',
  },
  transition: {
    duration: 0.5,
  },
};

export const PAGE_ANIMATION_PROPS: HTMLMotionProps<'div'> = {
  initial: {
    opacity: 0,
    y: '100vh',
    position: 'fixed',
    pointerEvents: 'none',
  },
  animate: {
    opacity: 1,
    y: 0,
    position: 'initial',
    pointerEvents: 'initial',
  },
  exit: {
    opacity: 0,
    y: '-100vh',
    position: 'fixed',
    pointerEvents: 'none',
  },
  transition: {
    duration: 0.5,
  },
};
