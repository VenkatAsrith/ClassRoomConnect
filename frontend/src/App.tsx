import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore.ts';

// Pages & Layouts
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import WorkspaceSetup from './pages/onboarding/WorkspaceSetup.tsx';
import WorkspaceLayout from './layouts/WorkspaceLayout.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
import ChannelView from './pages/channels/ChannelView.tsx';
import Announcements from './pages/announcements/Announcements.tsx';
import AssignmentsList from './pages/assignments/AssignmentsList.tsx';
import AssignmentDetail from './pages/assignments/AssignmentDetail.tsx';
import Resources from './pages/resources/Resources.tsx';
import Schedule from './pages/schedule/Schedule.tsx';
import Members from './pages/members/Members.tsx';
import Settings from './pages/settings/Settings.tsx';
import Search from './pages/search/Search.tsx';
import Activity from './pages/activity/Activity.tsx';

// Route Guards
import { RequireAuth, RequireWorkspace } from './routes/guards.tsx';

const queryClient = new QueryClient();

// Redirect core landing to active workspace dashboard or login page
const LandingRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.activeWorkspaceId) {
    return <Navigate to={`/w/${user.activeWorkspaceId}`} replace />;
  }
  return <Navigate to="/onboarding/workspace" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Guarded Routes */}
          <Route element={<RequireAuth />}>
            <Route path="/onboarding/workspace" element={<WorkspaceSetup />} />
            
            {/* Workspace Member Scoped Routes */}
            <Route element={<RequireWorkspace />}>
              <Route path="/w/:workspaceId" element={<WorkspaceLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="channels/:channelId" element={<ChannelView />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="assignments" element={<AssignmentsList />} />
                <Route path="assignments/:id" element={<AssignmentDetail />} />
                <Route path="resources" element={<Resources />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="members" element={<Members />} />
                <Route path="settings" element={<Settings />} />
                <Route path="search" element={<Search />} />
                <Route path="activity" element={<Activity />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Redirects */}
          <Route path="/" element={<LandingRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
