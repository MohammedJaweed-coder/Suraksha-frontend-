import { create } from 'zustand';

export type UserRole = 'user' | 'admin';

interface AuthState {
  token: string | null;
  deviceId: string;
  role: UserRole;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, deviceId: string, role?: UserRole, email?: string) => void;
  clearAuth: () => void;
}

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem('kaval-device-id');
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  localStorage.setItem('kaval-device-id', next);
  return next;
}

const initialToken = localStorage.getItem('kaval-token');
const initialDeviceId = getOrCreateDeviceId();
const initialRole = (localStorage.getItem('kaval-role') as UserRole) || 'user';
const initialEmail = localStorage.getItem('kaval-email');

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  deviceId: initialDeviceId,
  role: initialRole,
  email: initialEmail,
  isAuthenticated: Boolean(initialToken),
  setAuth: (token, deviceId, role = 'user', email = null) => {
    localStorage.setItem('kaval-token', token);
    localStorage.setItem('kaval-device-id', deviceId);
    localStorage.setItem('kaval-role', role);
    if (email) localStorage.setItem('kaval-email', email);
    set({ token, deviceId, role, email: email || get().email, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('kaval-token');
    localStorage.removeItem('kaval-role');
    localStorage.removeItem('kaval-email');
    set({ token: null, role: 'user', email: null, deviceId: getOrCreateDeviceId(), isAuthenticated: false });
  }
}));
