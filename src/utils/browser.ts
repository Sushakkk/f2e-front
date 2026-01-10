const MOBILE_USER_AGENT_PATTERN =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;

const ensureDocumentListener = (() => {
  let isAttached = false;

  return () => {
    if (typeof document === 'undefined' || isAttached) {
      return;
    }

    document.addEventListener(
      'touchstart',
      () => {
        // empty handler is needed to make :active styles work on iOS
      },
      { passive: true }
    );

    isAttached = true;
  };
})();

export const fixActive = (): void => {
  ensureDocumentListener();
};

export const checkMobile = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return MOBILE_USER_AGENT_PATTERN.test(navigator.userAgent);
};

export const loadImages = async (images: string[]): Promise<void> => {
  if (typeof window === 'undefined' || !images.length) {
    return;
  }

  await Promise.all(
    images.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image();

          image.decoding = 'async';
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = src;
        })
    )
  );
};
