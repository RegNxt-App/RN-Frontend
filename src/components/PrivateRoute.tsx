import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem('jwtToken');

  return token ? <>{children}</> : <Navigate to="/auth/signin" replace />;
};

export default PrivateRoute;
