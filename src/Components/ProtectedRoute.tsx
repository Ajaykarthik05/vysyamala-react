import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectTo: string; // Type for the redirect URL
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo }) => {
  const token = sessionStorage.getItem('token');

  // If token is not present, redirect to the specified route
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // If token is present, render the protected component
  return <Outlet />;
};

export default ProtectedRoute;
