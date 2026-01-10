import { useRootStore } from 'store/globals/root';
import { type IRootStore } from 'store/globals/root/declaration';

type SubStore<S extends keyof IRootStore> = S extends `${string}Store` ? S : never;

const createSubStoreHook = <S extends keyof IRootStore>(
  storeName: SubStore<S>
): (() => IRootStore[S]) => {
  const getError = () => new Error(`"${storeName}" not found!`);

  return () => {
    try {
      const store = useRootStore()[storeName];

      if (!store) {
        throw getError();
      }

      return store;
    } catch (error) {
      throw getError();
    }
  };
};

export const useAppParamsStore = createSubStoreHook('appParamsStore');

export const useRouterStore = createSubStoreHook('routerStore');
