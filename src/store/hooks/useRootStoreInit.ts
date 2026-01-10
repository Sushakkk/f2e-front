import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useRootStore } from 'store/globals/root';

export const useRootStoreInit = () => {
  const { init, appState } = useRootStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!appState.initial) {
      return;
    }

    void init({
      navigate,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.initial]);

  return { appState };
};
