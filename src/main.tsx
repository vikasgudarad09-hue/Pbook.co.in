import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unhandled cross-origin third-party ad script errors from breaking the app UI
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || event.message?.includes('Script error')) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || '');
  if (msg.includes('Script error') || msg.includes('Failed to fetch')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

