import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the Unified Service Worker for both PWA caching and Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((reg) => {
        console.log('Unified PWA & Firebase Messaging Service Worker registered with scope: ', reg.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration failed: ', err);
      });
  });
}
