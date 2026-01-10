import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { rootStore } from 'store/globals/root';
import { fixActive } from 'utils/browser';
import { initSentry, initEruda } from 'utils/init';

import './styles/global.scss';

import App from './App';

const startApp = () => {
  fixActive();

  initEruda(rootStore.appParamsStore.isDev);
  initSentry(rootStore.appParamsStore);

  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
