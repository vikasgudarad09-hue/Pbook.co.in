import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unhandled cross-origin third-party ad script errors from breaking the app UI
window.onerror = (message, source, lineno, colno, error) => {
  const msg = typeof message === 'string' ? message : '';
  if (msg === 'Script error.' || msg.includes('Script error') || !source || source.includes('effectivecpmnetwork')) {
    return true; // Suppresses the error
  }
  return false;
};

window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || event.message?.includes('Script error') || (event.filename && event.filename.includes('effectivecpmnetwork'))) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || '');
  if (msg.includes('Script error') || msg.includes('Failed to fetch')) {
    event.preventDefault();
    event.stopPropagation();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

