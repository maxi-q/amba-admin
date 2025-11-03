import { create } from 'zustand'

interface StoreState {
  auth: boolean
  token: string
  login: (token: string) => void
  logout: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<StoreState>((set) => ({
  auth: false,
  token: '',
  login: (token: string) => {
    set({ auth: true, token });
    localStorage.setItem('token', token);
  },
  logout: () => {
    set({ auth: false, token: '' });
    localStorage.removeItem('token');
  },
  setToken: (token: string) => {
    set({ token });
    localStorage.setItem('token', token);
  },
}))
