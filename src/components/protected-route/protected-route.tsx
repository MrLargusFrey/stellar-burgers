import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '@ui';

interface ProtectedRouteProps {
  children: React.ReactElement;
  onlyUnAuth?: boolean;
}

export const ProtectedRoute = ({ children, onlyUnAuth = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthenticated, isAuthChecked } = useSelector((state) => state.user);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (onlyUnAuth && isAuthenticated) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};