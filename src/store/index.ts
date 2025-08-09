import type { IRoomData } from '@services/rooms/rooms.types'
import type { ISprint } from '@services/sprints/sprints.types'
import type { IEvent } from '@services/events/events.types'
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
interface RoomDataState {
  roomData: IRoomData | null
  sprintData: ISprint[]
  eventData: IEvent[]
  setRoomData: (roomData: IRoomData | null) => void
  clearRoomData: () => void
  isLoading: boolean
  setIsLoading: (ok: boolean) => void
  addSprint: (sprintData: ISprint) => void
  loadSprints: (sprintData: ISprint[]) => void
  updateSprint: (sprintId: string, updatedSprintData: Partial<ISprint>) => void
  loadEvents: (eventData: IEvent[]) => void
  addEvent: (eventData: IEvent) => void
  updateEvent: (eventId: string, updatedEventData: Partial<IEvent>) => void
}

export const useRoomDataStore = create<RoomDataState>((set) => ({
  roomData: null,
  sprintData: [],
  eventData: [],

  setRoomData: (roomData: IRoomData | null) => set({ roomData }),

  loadSprints: (sprintData: ISprint[]) =>
    set(() => ({
      sprintData: sprintData
    })),

  addSprint: (sprintData: ISprint) =>
    set((state) => ({
      sprintData: [...state.sprintData, sprintData]
    })),

  updateSprint: (sprintId: string, updatedSprintData: Partial<ISprint>) =>
    set((state) => ({
      sprintData: state.sprintData?.map((sprint) =>
              sprint.id === sprintId
                ? { ...sprint, ...updatedSprintData }
                : sprint
            ) ?? [],
    })),

  loadEvents: (eventData: IEvent[]) =>
    set(() => ({
      eventData: eventData
    })),

  addEvent: (eventData: IEvent) =>
    set((state) => ({
      eventData: [...state.eventData, eventData]
    })),

  updateEvent: (eventId: string, updatedEventData: Partial<IEvent>) =>
    set((state) => ({
      eventData: state.eventData?.map((event) =>
              event.id === eventId
                ? { ...event, ...updatedEventData }
                : event
            ) ?? [],
    })),

  clearRoomData: () => set({ roomData: null }),

  isLoading: false,
  setIsLoading: (ok: boolean) => set({ isLoading: ok }),
}));