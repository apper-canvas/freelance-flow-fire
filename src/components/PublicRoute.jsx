import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PublicRoute() {
  const { isAuthenticated, loading } = useSelector((state) => state.user);

  // While loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If already authenticated, redirect to home/dashboard, otherwise render the public content
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoute;