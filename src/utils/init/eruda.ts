export const initEruda = (isDev: boolean) => {
  if (isDev) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    void import('eruda')
      .then((module) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        module.default?.init?.();
      })
      .catch();
  }
};
