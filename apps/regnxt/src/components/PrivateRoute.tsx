import React from 'react';
import {Navigate} from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({children}: PrivateRouteProps) => {
  const token = localStorage.getItem('token');

  return token ? (
    <>{children}</>
  ) : (
    <Navigate
      to="/auth/signin"
      replace
    />
  );
};

export default PrivateRoute;
