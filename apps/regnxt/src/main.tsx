import React, {ComponentProps} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router} from 'react-router-dom';

import axiosInstance from '@/lib/axios';

import 'flatpickr/dist/flatpickr.min.css';

import * as Sentry from '@sentry/react';
import {SWRConfig} from 'swr';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import {AuthProvider} from './contexts/AuthContext';

import './index.css';

Sentry.init({
  dsn: 'https://f92b420690bc616e599dd7080de5c12b@o4508769581072384.ingest.de.sentry.io/4508769583956048',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const swrConfig = {
  fetcher: (res: string) => axiosInstance.get(res).then((r) => r.data),
  focusThrottleInterval: 30000,
} satisfies ComponentProps<typeof SWRConfig>['value'];

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SWRConfig value={swrConfig}>
          <Router>
            <App />
          </Router>
        </SWRConfig>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
