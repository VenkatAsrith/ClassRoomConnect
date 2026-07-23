import { create } from 'zustand';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatarUrl?: string;
  activeWorkspaceId?: string;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  updateUser: (user: UserProfile) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('cc_user') || 'null'),
  accessToken: localStorage.getItem('cc_accessToken'),
  refreshToken: localStorage.getItem('cc_refreshToken'),
  isAuthenticated: !!localStorage.getItem('cc_accessToken'),
  
  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem('cc_user', JSON.stringify(user));
    localStorage.setItem('cc_accessToken', accessToken);
    localStorage.setItem('cc_refreshToken', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },
  
  updateUser: (user) => {
    localStorage.setItem('cc_user', JSON.stringify(user));
    set({ user });
  },
  
  clearSession: () => {
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_accessToken');
    localStorage.removeItem('cc_refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  }
}));
