import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo = "/transform" 
}: ProtectedRouteProps) => {
  const { user, isLoaded } = useUser();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (requireAuth && !user) {
        // User is not authenticated but route requires auth
        setShouldRedirect(true);
      } else if (!requireAuth && user) {
        // User is authenticated but route doesn't require auth (landing page)
        setShouldRedirect(true);
      }
    }
  }, [user, isLoaded, requireAuth]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"></div>
      </div>
    );
  }

  if (shouldRedirect) {
    if (requireAuth && !user) {
      // Redirect unauthenticated users to landing page
      return <Navigate to="/" replace />;
    } else if (!requireAuth && user) {
      // Redirect authenticated users to transformation page
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
