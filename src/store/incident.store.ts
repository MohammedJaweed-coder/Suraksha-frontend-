import { create } from 'zustand';
import type { Incident, ToastItem } from '../types';

interface IncidentState {
  recentReports: Incident[];
  pendingSyncIds: string[];
  toasts: ToastItem[];
  isSyncing: boolean;
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  setIncidents: (incidents: Incident[]) => void;
  deleteIncident: (id: string) => void;
  markPendingSync: (id: string) => void;
  clearPendingSync: (ids?: string[]) => void;
  pushToast: (toast: ToastItem) => void;
  removeToast: (id: string) => void;
  setSyncing: (isSyncing: boolean) => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  recentReports: [],
  pendingSyncIds: [],
  toasts: [],
  isSyncing: false,
  addIncident: (incident) =>
    set((state) => ({
      recentReports: [incident, ...state.recentReports.filter((item) => item?.id !== incident?.id)]
    })),
  setIncidents: (incidents) => set({ recentReports: incidents }),
  updateIncident: (id, updates) =>
    set((state) => ({
      recentReports: state.recentReports.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    })),
  deleteIncident: (id) =>
    set((state) => ({
      recentReports: state.recentReports.filter((item) => item.id !== id)
    })),
  markPendingSync: (id) =>
    set((state) => ({
      pendingSyncIds: state.pendingSyncIds.includes(id) ? state.pendingSyncIds : [...state.pendingSyncIds, id]
    })),
  clearPendingSync: (ids) =>
    set((state) => ({
      pendingSyncIds: ids ? state.pendingSyncIds.filter((id) => !ids.includes(id)) : []
    })),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, toast]
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),
  setSyncing: (isSyncing) => set({ isSyncing })
}));
