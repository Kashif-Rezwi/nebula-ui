import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { storage } from '../../utils';
import type { ProtectedRouteProps } from '../../types';

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = storage.getToken();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}