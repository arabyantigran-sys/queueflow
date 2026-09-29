import { create } from 'zustand';
import { platformApi } from '../data/platformApi';
import type { Business, PlanId, SalonLifecycle, SalonRequest, SalonRequestStatus } from '../types';

interface PlatformState {
  isAuthenticated: boolean;
  requests: SalonRequest[];
  salons: Business[];
  loading: boolean;
  toast: string | null;
  sidebarOpen: boolean;

  login: (email: string, password: string) => boolean;
  logout: () => void;
  hydrate: () => Promise<void>;
  setSidebarOpen: (open: boolean) => void;
  showToast: (msg: string) => void;

  setRequestStatus: (id: string, status: SalonRequestStatus, notes?: string) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  setSalonStatus: (id: string, status: SalonLifecycle) => Promise<void>;
  setSalonPlan: (id: string, plan: PlanId) => Promise<void>;
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  isAuthenticated: typeof window !== 'undefined' ? platformApi.isLoggedIn() : false,
  requests: [],
  salons: [],
  loading: false,
  toast: null,
  sidebarOpen: false,

  login: (email, password) => {
    if (!platformApi.checkCredentials(email, password)) return false;
    platformApi.setLoggedIn(true);
    set({ isAuthenticated: true });
    return true;
  },

  logout: () => {
    platformApi.setLoggedIn(false);
    set({ isAuthenticated: false, requests: [], salons: [] });
  },

  hydrate: async () => {
    set({ loading: true });
    try {
      const [requests, salons] = await Promise.all([
        platformApi.listRequests(),
        platformApi.listSalons(),
      ]);
      set({ requests, salons });
    } finally {
      set({ loading: false });
    }
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: null }), 2800);
  },

  setRequestStatus: async (id, status, notes) => {
    await platformApi.updateRequestStatus(id, status, notes);
    await get().hydrate();
    get().showToast('Կարգավիճակը թարմացված է');
  },

  approveRequest: async (id) => {
    await platformApi.approveRequest(id);
    await get().hydrate();
    get().showToast('Սրահը հաստատված և ակտիվացված է');
  },

  setSalonStatus: async (id, status) => {
    await platformApi.setSalonStatus(id, status);
    await get().hydrate();
    get().showToast('Սրահի կարգավիճակը թարմացված է');
  },

  setSalonPlan: async (id, plan) => {
    await platformApi.setSalonPlan(id, plan);
    await get().hydrate();
    get().showToast('Փաթեթը թարմացված է');
  },
}));
