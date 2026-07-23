import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  activeModal: string | null;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveModal: (modalId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => {
  const initialTheme = (localStorage.getItem('cc_theme') as 'light' | 'dark') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    theme: initialTheme,
    sidebarCollapsed: false,
    activeModal: null,
    
    toggleTheme: () => 
      set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('cc_theme', nextTheme);
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: nextTheme };
      }),
      
    setTheme: (theme) => {
      localStorage.setItem('cc_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },
    
    setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    
    setActiveModal: (activeModal) => set({ activeModal })
  };
});
