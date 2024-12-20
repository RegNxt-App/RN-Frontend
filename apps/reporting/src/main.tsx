import React, {ComponentProps} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router} from 'react-router-dom';

import axiosInstance from '@/lib/axios';
import 'flatpickr/dist/flatpickr.min.css';
import {SWRConfig} from 'swr';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import {AuthProvider} from './contexts/AuthContext';
import './index.css';

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
