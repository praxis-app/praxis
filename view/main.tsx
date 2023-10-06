import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-lazy-load-image-component/src/effects/blur.css';
import App from './App';
import client from './apollo/client';
import './locales/i18n.config';
import './styles/globals.css';
import theme from './styles/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
