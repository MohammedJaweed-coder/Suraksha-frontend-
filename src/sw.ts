/* eslint-disable no-restricted-globals */
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(
  ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style',
  new NetworkFirst({
    cacheName: 'kaval-app-shell'
  })
);

registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.includes('/map/heatmap'),
  new NetworkFirst({
    cacheName: 'kaval-heatmap-cache',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 300, maxEntries: 50 })]
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/locales/'),
  new CacheFirst({
    cacheName: 'kaval-i18n-cache'
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'POST' && (url.pathname.includes('/incidents/sos') || url.pathname.includes('/incidents/violation')),
  new NetworkFirst({
    cacheName: 'kaval-upload-queue',
    plugins: [
      new BackgroundSyncPlugin('kaval-media-uploads', {
        maxRetentionTime: 24 * 60
      })
    ]
  }),
  'POST'
);

self.addEventListener('install', () => {
  console.info('Kaval service worker installed');
});

self.addEventListener('activate', () => {
  console.info('Kaval service worker activated');
});
