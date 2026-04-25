import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './i18n';
import './index.css';

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('Kaval is ready for offline use.');
  },
  onRegisterError(error) {
    console.error('Service worker registration failed', error);
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
