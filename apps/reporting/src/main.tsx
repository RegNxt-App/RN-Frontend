import 'flatpickr/dist/flatpickr.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/satoshi.css';
import './css/style.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router basename="/reporting">
      <App />
    </Router>
  </React.StrictMode>,
);
