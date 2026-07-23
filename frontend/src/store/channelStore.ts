import { create } from 'zustand';

interface ChannelState {
  activeChannelId: string | null;
  drafts: Record<string, string>; // channelId -> message draft text
  typingUsers: Record<string, string[]>; // channelId -> user names list
  setActiveChannel: (channelId: string | null) => void;
  setDraft: (channelId: string, text: string) => void;
  setTypingUsers: (channelId: string, users: string[]) => void;
  clearChannelContext: () => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  activeChannelId: null,
  drafts: {},
  typingUsers: {},
  
  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),
  
  setDraft: (channelId, text) => 
    set((state) => ({
      drafts: { ...state.drafts, [channelId]: text }
    })),
    
  setTypingUsers: (channelId, users) => 
    set((state) => ({
      typingUsers: { ...state.typingUsers, [channelId]: users }
    })),
    
  clearChannelContext: () => set({ activeChannelId: null, drafts: {}, typingUsers: {} })
}));
