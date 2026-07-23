import { create } from 'zustand';

interface Workspace {
  _id: string;
  name: string;
  subject: string;
  description?: string;
  ownerId: string;
  joinCode: string;
  memberCount: number;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeWorkspace: Workspace | null;
  role: 'teacher' | 'student' | null;
  setActiveWorkspace: (workspace: Workspace | null, role: 'teacher' | 'student' | null) => void;
  clearWorkspaceContext: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: localStorage.getItem('cc_activeWorkspaceId'),
  activeWorkspace: null,
  role: (localStorage.getItem('cc_workspaceRole') as 'teacher' | 'student' | null),
  
  setActiveWorkspace: (workspace, role) => {
    if (workspace) {
      localStorage.setItem('cc_activeWorkspaceId', workspace._id);
      if (role) localStorage.setItem('cc_workspaceRole', role);
      set({ activeWorkspaceId: workspace._id, activeWorkspace: workspace, role });
    } else {
      localStorage.removeItem('cc_activeWorkspaceId');
      localStorage.removeItem('cc_workspaceRole');
      set({ activeWorkspaceId: null, activeWorkspace: null, role: null });
    }
  },
  
  clearWorkspaceContext: () => {
    localStorage.removeItem('cc_activeWorkspaceId');
    localStorage.removeItem('cc_workspaceRole');
    set({ activeWorkspaceId: null, activeWorkspace: null, role: null });
  }
}));
