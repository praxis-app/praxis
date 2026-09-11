import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@livekit/components-styles';
import './locales/i18n.config';
import { appRouter } from './routes/app.router';
import './styles/globals.css';

// TODO: Remove this if it doesn't actually resolve issue with suspended Chrome tabs
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={appRouter} />
  </StrictMode>,
);
