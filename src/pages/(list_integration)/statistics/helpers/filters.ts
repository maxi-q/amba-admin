import type { EventData } from '../types';

export const filterEvents = (
  events: EventData[], 
  selectedAmbassadors: string[],
  selectedSprints: string[],
  selectedEvents: string[]
): EventData[] => {
  let filtered = events;

  // Фильтр по амбассадорам (пока используется имя из event.name)
  if (selectedAmbassadors.length > 0) {
    // TODO: Заменить на реальную фильтрацию по ID амбассадоров когда будет API
    filtered = filtered.filter(event => 
      selectedAmbassadors.some(ambId => event.name.includes(ambId))
    );
  }

  // Фильтр по спринтам
  if (selectedSprints.length > 0) {
    // TODO: Добавить поле sprintId в EventData когда будет API
    // filtered = filtered.filter(event => selectedSprints.includes(event.sprintId));
  }

  // Фильтр по событиям
  if (selectedEvents.length > 0) {
    // TODO: Добавить поле eventId в EventData когда будет API
    // filtered = filtered.filter(event => selectedEvents.includes(event.eventId));
  }

  return filtered;
};