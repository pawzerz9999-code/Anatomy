import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { factoryClock, useFactory } from './factory/store';
import { useStore } from './state/store';
import { runtime } from './viewer/runtime';
import './styles.css';

// Handy for tinkering in the browser console and for end-to-end tests.
(window as unknown as { droneAnatomy: unknown }).droneAnatomy = { useStore, runtime, useFactory, factoryClock };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
