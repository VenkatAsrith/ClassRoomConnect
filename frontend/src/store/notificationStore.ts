import { create } from 'zustand';

export interface NotificationItem {
  _id: string;
  userId: string;
  workspaceId: string;
  type: 'assignment' | 'announcement' | 'join' | 'resource' | 'schedule';
  message: string;
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  setNotifications: (items: NotificationItem[]) => void;
  addNotification: (item: NotificationItem) => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  
  setNotifications: (items) => {
    const unreadCount = items.filter(i => !i.isRead).length;
    set({ items, unreadCount });
  },
  
  addNotification: (item) => 
    set((state) => {
      // Avoid duplicate notifications (if socket sends what HTTP fetched)
      if (state.items.some(i => i._id === item._id)) {
        return {};
      }
      const items = [item, ...state.items];
      const unreadCount = items.filter(i => !i.isRead).length;
      return { items, unreadCount };
    }),
    
  markRead: (id) => 
    set((state) => {
      const items = state.items.map(i => i._id === id ? { ...i, isRead: true } : i);
      const unreadCount = items.filter(i => !i.isRead).length;
      return { items, unreadCount };
    }),
    
  clearNotifications: () => set({ items: [], unreadCount: 0 })
}));
