import React, { useEffect, useState } from 'react';
import { Outlet, useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.ts';
import { useWorkspaceStore } from '../store/workspaceStore.ts';
import { useNotificationStore, type NotificationItem } from '../store/notificationStore.ts';
import { useUIStore } from '../store/uiStore.ts';
import { api } from '../services/api.ts';
import {
  Bell,
  LogOut,
  Hash,
  BookOpen,
  Calendar,
  Layers,
  Settings,
  FolderOpen,
  Users,
  Search,
  Activity,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export const WorkspaceLayout: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user, clearSession } = useAuthStore();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { addNotification, setNotifications, unreadCount } = useNotificationStore();
  const { theme, toggleTheme } = useUIStore();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [channels, setChannels] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);

  // Real-time socket reference
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch Workspace details & channels
  useEffect(() => {
    if (!workspaceId) return;

    const fetchWorkspaceData = async () => {
      try {
        const wsRes = await api.get(`/workspaces/${workspaceId}`);
        const role = wsRes.data.workspace.ownerId === user?._id ? 'teacher' : 'student';
        setActiveWorkspace(wsRes.data.workspace, role);

        const chanRes = await api.get(`/channels/workspace/${workspaceId}`);
        setChannels(chanRes.data.channels);
      } catch (err) {
        console.error('Error fetching workspace details:', err);
        // If not a member, redirect to onboarding
        navigate('/onboarding/workspace');
      }
    };

    fetchWorkspaceData();
  }, [workspaceId, setActiveWorkspace, user?._id, navigate]);

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications);
        setNotificationsList(res.data.notifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, [setNotifications]);

  // Configure Socket.IO Client
  useEffect(() => {
    if (!workspaceId || !user) return;

    const accessToken = localStorage.getItem('cc_accessToken');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token: accessToken },
      query: { token: accessToken }
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO client connected.');
      newSocket.emit('workspace:join', { workspaceId });
    });

    // Realtime listeners
    newSocket.on('notification:new', (notification: NotificationItem) => {
      addNotification(notification);
      setNotificationsList(prev => [notification, ...prev]);
    });

    newSocket.on('channel:message', (msg: any) => {
      // Handled inside individual channel view hook or global event trigger
      const customEvent = new CustomEvent(`socket-msg:${msg.channelId}`, { detail: msg });
      window.dispatchEvent(customEvent);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [workspaceId, user, addNotification]);

  const handleLogout = () => {
    clearSession();
    setActiveWorkspace(null, null);
    navigate('/login');
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      useNotificationStore.getState().markRead(id);
      setNotificationsList(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const sidebarLinks = [
    { label: 'Dashboard', path: `/w/${workspaceId}`, icon: Layers },
    { label: 'Announcements', path: `/w/${workspaceId}/announcements`, icon: Bell },
    { label: 'Assignments', path: `/w/${workspaceId}/assignments`, icon: BookOpen },
    { label: 'Resources Library', path: `/w/${workspaceId}/resources`, icon: FolderOpen },
    { label: 'Weekly Schedule', path: `/w/${workspaceId}/schedule`, icon: Calendar },
    { label: 'Members', path: `/w/${workspaceId}/members`, icon: Users },
    { label: 'Workspace Activity', path: `/w/${workspaceId}/activity`, icon: Activity }
  ];

  // Render navigation lists
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#F5F5F5] dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 w-64 md:w-60">
      
      {/* Workspace Header Info */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white truncate">
          {activeWorkspace?.name || 'Classroom Connect'}
        </h2>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
          {activeWorkspace?.subject || 'Workspace'}
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        
        {/* Core Sections */}
        <div className="space-y-0.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActiveLink(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Discord-style Channels lists */}
        <div className="pt-6 space-y-2">
          <div className="flex items-center justify-between px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <span>Channels</span>
            {useWorkspaceStore.getState().role === 'teacher' && (
              <Link 
                to={`/w/${workspaceId}/settings`} 
                className="hover:text-zinc-600 dark:hover:text-white"
              >
                <Settings className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div className="space-y-0.5">
            {channels.map((ch) => {
              const chPath = `/w/${workspaceId}/channels/${ch._id}`;
              const active = isActiveLink(chPath);
              return (
                <Link
                  key={ch._id}
                  to={chPath}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-accentblue text-white font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </Link>
              );
            })}
            {channels.length === 0 && (
              <span className="block px-3 text-[11px] text-zinc-400 italic">No channels created</span>
            )}
          </div>
        </div>

      </nav>

      {/* Workspace Footer Profile */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {user?.name}
            </h4>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize font-medium block">
              {user?.role}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Settings / General Settings for Workspace */}
          {useWorkspaceStore.getState().role === 'teacher' && (
            <Link
              to={`/w/${workspaceId}/settings`}
              className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Sidebar: Desktop Navigation */}
      <div className="hidden md:block shrink-0">
        {renderSidebarContent()}
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-900 px-4 flex items-center justify-between bg-white dark:bg-[#121214] sticky top-0 z-40">
          
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Classroom
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest hidden sm:inline">
                Connect
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search link */}
            <Link
              to={`/w/${workspaceId}/search`}
              className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all flex items-center gap-1.5 px-3"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold text-zinc-400 tracking-wide hidden sm:inline">Search workspace...</span>
            </Link>

            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white dark:border-zinc-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Notifications</h4>
                    <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                    {notificationsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400 italic">No alerts yet</div>
                    ) : (
                      notificationsList.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => {
                            markNotificationRead(n._id);
                            if (n.type === 'announcement') navigate(`/w/${workspaceId}/announcements`);
                            if (n.type === 'assignment') navigate(`/w/${workspaceId}/assignments`);
                            if (n.type === 'resource') navigate(`/w/${workspaceId}/resources`);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-left text-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex flex-col gap-1 ${!n.isRead ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''}`}
                        >
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 leading-normal">{n.message}</span>
                          <span className="text-[9px] text-zinc-400 uppercase font-semibold">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Viewport for internal pages */}
        <main className="flex-1 overflow-y-auto relative p-6 sm:p-8">
          <Outlet context={{ socket }} />
        </main>

      </div>

      {/* Mobile Drawer Slide Navigation Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-zinc-950/40 backdrop-blur-sm">
          <div className="relative w-64 animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 border border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-950 text-zinc-500"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebarContent()}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

    </div>
  );
};
export default WorkspaceLayout;
