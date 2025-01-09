import React, {createContext, useContext} from 'react';
import {useLocation} from 'react-router-dom';

import {birdBackendInstance, orchestraBackendInstance} from '@/lib/axios';
import type {AxiosInstance} from 'axios';

interface BackendContextType {
  backendInstance: AxiosInstance;
}

const BackendContext = createContext<BackendContextType | null>(null);

export const BackendProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const location = useLocation();

  const getBackendInstance = () => {
    if (location.pathname.includes('/bird/')) {
      return birdBackendInstance;
    }
    if (location.pathname.includes('/orchestra/')) {
      return orchestraBackendInstance;
    }
    return birdBackendInstance;
  };

  const value = {backendInstance: getBackendInstance()};

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
};

export const getBackendInstance = () => {
  const location = window.location;
  if (location.pathname.includes('/bird/')) {
    return birdBackendInstance;
  }
  if (location.pathname.includes('/orchestra/')) {
    return orchestraBackendInstance;
  }
  return birdBackendInstance;
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    return {backendInstance: getBackendInstance()};
  }
  return context;
};
