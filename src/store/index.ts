import { create } from 'zustand'

interface StoreState {
  count: number
  inc: () => void
}

export const useStore = create<StoreState>((set) => ({
  count: 1,
  inc: () => set((state: { count: number }) => ({ count: state.count + 1 })),
}))
