import { create } from 'zustand'
import type { ProjectProvider } from '@/services/projects/projects.types';
import { senlerIoLaunch } from '@/services/auth/senler-io-launch';
import { SENLER_IO_REFRESH_STORAGE_KEY } from '@/services/auth/senler-io-credentials';

interface StoreState {
  auth: boolean
  token: string
  login: (token: string, provider?: ProjectProvider, refreshToken?: string) => void
  logout: () => void
  setToken: (token: string) => void
}

// Signed Senler.ru launches always authenticate their own project, even if an
// unrelated Senler.io session was previously saved in this browser.
// Embedded IO launches stay unauthenticated until /senler-io/resume verifies
// that the saved session and signed launch refer to the same project.
const launchParams = new URLSearchParams(window.location.search);
const savedIoToken = localStorage.getItem('authProvider') === 'SENLER_IO' &&
  !senlerIoLaunch.embedded &&
  !launchParams.has('sign') && !launchParams.has('group_id')
  ? localStorage.getItem('token') || ''
  : '';

export const useAuthStore = create<StoreState>((set) => ({
  auth: !!savedIoToken,
  token: savedIoToken,
  login: (token: string, provider?: ProjectProvider, refreshToken?: string) => {
    if (provider === 'SENLER_IO' && refreshToken) {
      localStorage.setItem(SENLER_IO_REFRESH_STORAGE_KEY, JSON.stringify({ id: crypto.randomUUID(), refreshToken }));
    } else if (provider !== 'SENLER_IO' || localStorage.getItem('token') !== token) {
      localStorage.removeItem(SENLER_IO_REFRESH_STORAGE_KEY);
    }
    localStorage.setItem('token', token);
    if (provider) localStorage.setItem('authProvider', provider);
    else localStorage.removeItem('authProvider');
    set({ auth: true, token });
  },
  logout: () => {
    localStorage.removeItem(SENLER_IO_REFRESH_STORAGE_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('authProvider');
    set({ auth: false, token: '' });
  },
  setToken: (token: string) => {
    set({ token });
    localStorage.setItem('token', token);
  },
}))
