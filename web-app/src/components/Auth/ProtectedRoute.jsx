import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Wrap a page with <ProtectedRoute roles={['DOCTOR']}>...</ProtectedRoute>
// to require login and (optionally) a specific role.
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles) {
    const allowed = [...roles];
    if (allowed.includes('RECEPTIONIST') && !allowed.includes('STAFF')) allowed.push('STAFF');
    if (allowed.includes('STAFF') && !allowed.includes('RECEPTIONIST')) allowed.push('RECEPTIONIST');
    if (!allowed.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
