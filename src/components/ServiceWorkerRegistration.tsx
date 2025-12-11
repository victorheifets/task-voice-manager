'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker after page load for better performance
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Service Worker registered:', registration.scope);
            }

            // Check for updates periodically
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, can prompt user to refresh
                    if (process.env.NODE_ENV === 'development') {
                      console.log('New content available, please refresh');
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('Service Worker registration failed:', error);
            }
          });
      });
    }
  }, []);

  return null;
}
