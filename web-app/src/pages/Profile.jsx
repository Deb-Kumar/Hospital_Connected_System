import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Profile() {
  return <Navigate to="/patient?tab=profile" state={{ tab: 'profile' }} replace />;
}
