import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { useWorkspaceStore } from '../store/workspaceStore.ts';

export const RequireAuth = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to first-time onboarding profile setup if user exists but has no name/profile completion
  if (user && !user.name) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  return <Outlet />;
};

export const RequireWorkspace = () => {
  const { user } = useAuthStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const params = useParams();

  // If URL has workspaceId, verify it matches
  const targetWorkspaceId = params.workspaceId || activeWorkspaceId || user?.activeWorkspaceId;

  if (!targetWorkspaceId) {
    return <Navigate to="/onboarding/workspace" replace />;
  }

  return <Outlet />;
};

export const RequireRole = ({ allowedRole }: { allowedRole: 'teacher' | 'student' }) => {
  const { user } = useAuthStore();

  if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
