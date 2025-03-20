import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  lastGreeting: string;
  setLastGreeting: (greeting: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      lastGreeting: '',
      setLastGreeting: (greeting) => set({ lastGreeting: greeting }),
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'maestro-app-storage',
    }
  )
); 