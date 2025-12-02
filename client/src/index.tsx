import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClickProvider } from '@make-software/csprclick-ui';
import App from './App';
import config from './services/config';

const clickOptions = {
  appId: config.csprClickAppId,
  appName: 'StakeVue',
  contentMode: 'iframe' as const,
  providers: ['casper-wallet', 'ledger', 'metamask-snap' as const],
  appIcon: '/logo192.png',
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ClickProvider options={clickOptions}>
      <App />
    </ClickProvider>
  </React.StrictMode>
);
